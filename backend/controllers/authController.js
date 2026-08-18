const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Driver = require('../models/Driver');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const loginSchema = z.object({
      email: z.string().email("Please enter a valid email address").toLowerCase(),
      password: z.string().min(6, "Password must be at least 6 characters"),
      role: z.enum(['admin', 'driver', 'parent'], {
        errorMap: () => ({ message: "Invalid role selected" })
      })
    });

    const validated = loginSchema.parse({ email, password, role });

    const user = await User.findOne({ 
      email: validated.email, 
      role: validated.role 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(validated.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000
    });

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    };

    if (validated.role === 'driver') {
      const driver = await Driver.findOne({ user: user._id });
      if (driver) {
        responseData.user.driverId = driver._id;
        responseData.user.assignedBusId = driver.assignedBusId;
      }
    }

    res.json(responseData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    const schema = z.object({
      email: z.string().email().toLowerCase(),
      role: z.enum(['admin', 'driver', 'parent'])
    });
    const validated = schema.parse({ email, role });

    const user = await User.findOne({ email: validated.email, role: validated.role });
    const genericMessage = "If this email is registered, a reset code has been sent.";

    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = await bcrypt.hash(resetCode, 10);
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
      port: Number(process.env.MAILTRAP_PORT) || 2525,
      secure: process.env.MAILTRAP_PORT === '465',
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: '"VisageRoute Sandbox" <no-reply@visageroute.edu.pk>',
      to: user.email,
      subject: "VisageRoute — Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; padding: 20px; border: 1px solid #e8e4ce; border-radius: 8px;">
          <h2 style="color: #f2cc0d; margin-bottom: 4px;">VisageRoute</h2>
          <p style="color: #1c190d;">Dear User,</p>
          <p style="color: #6b6651;">Your password reset verification code is:</p>
          <h1 style="letter-spacing: 6px; color: #1c190d; background: #f8f8f5; text-align: center; padding: 12px; border-radius: 4px;">
            ${resetCode}
          </h1>
          <p style="font-size: 12px; color: #ef4444;">This validation code expires in 15 minutes.</p>
        </div>
      `
    });

    return res.status(200).json({ message: genericMessage });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, role, resetCode, newPassword } = req.body;

    const schema = z.object({
      email: z.string().email().toLowerCase(),
      role: z.enum(['admin', 'driver', 'parent']),
      resetCode: z.string().length(6, "Enter the 6-digit code"),
      newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, "Password must contain uppercase, number, and special character")
    });
    const validated = schema.parse({ email, role, resetCode, newPassword });

    const user = await User.findOne({ email: validated.email, role: validated.role });

    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    const isCodeValid = await bcrypt.compare(validated.resetCode, user.resetCode);
    if (!isCodeValid) {
      return res.status(400).json({ error: "Incorrect reset code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(validated.newPassword, salt);

    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. Please login." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, logout, forgotPassword, resetPassword };