const nodemailer = require('nodemailer');

// Initialize Nodemailer Transport for Mailtrap Sandbox SMTP
// Port 2525 or 587 are NOT blocked by cloud platforms (Port 25 times out).
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525, // Explicitly cast port to a Number
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 2525 / 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Explicit timeouts so network stalls fail fast instead of hanging (prevents ETIMEDOUT)
  connectionTimeout: 10000, // 10s to establish connection
  greetingTimeout: 10000,   // 10s for SMTP greeting
  socketTimeout: 10000,     // 10s for socket inactivity
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration on backend boot
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mailtrap SMTP Connection Error on Railway:', error.message);
    if (error.code) console.error('SMTP Error Code:', error.code);
  } else {
    console.log('✅ Mailtrap Sandbox SMTP connected successfully on port', process.env.SMTP_PORT || 2525);
  }
});

/**
 * Generic send email helper using the shared Mailtrap SMTP transporter.
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VisageRoute Admin" <no-reply@visageroute.com>',
      to,
      subject,
      text: text || '',
      html: html || `<p>${text || ''}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via Mailtrap Sandbox. Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email via Mailtrap SMTP:', error.message);
    if (error.code) console.error('SMTP Error Code:', error.code);
    if (error.command) console.error('Failed SMTP Command:', error.command);
    if (error.response) console.error('SMTP Response:', error.response);
    throw error;
  }
};

const sendRegistrationEmail = async (email, name, userId, password) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #f2cc0d;">Welcome to VisageRoute, ${name}!</h2>
        <p>Your administrative registration is complete. You can now log in to the portal using the following credentials:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your Login Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <span style="color: #e74c3c;">${password}</span></p>
        </div>
        <p>Please change your password after your first login for security purposes.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `;
    return await sendEmail({ to: email, subject: 'Your VisageRoute Registration Details', html });
  } catch (error) {
    console.error('❌ Email Service Error:', error.message);
    return false;
  }
};

const sendAnnouncementEmail = async (email, title, content, priority) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: ${priority === 'urgent' ? '#e74c3c' : '#f2cc0d'};">${title}</h2>
        <p style="white-space: pre-line;">${content}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777;">This is an official announcement from the school transport administrator.</p>
      </div>
    `;
    return await sendEmail({ to: email, subject: `${priority === 'urgent' ? '[URGENT] ' : ''}${title}`, html });
  } catch (error) {
    console.error('❌ Announcement Email Error:', error.message);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; padding: 20px; border: 1px solid #e8e4ce; border-radius: 8px;">
        <h2 style="color: #f2cc0d; margin-bottom: 4px;">VisageRoute</h2>
        <p style="color: #1c190d;">Dear User,</p>
        <p style="color: #6b6651;">Your password reset verification code is:</p>
        <h1 style="letter-spacing: 6px; color: #1c190d; background: #f8f8f5; text-align: center; padding: 12px; border-radius: 4px;">
          ${resetCode}
        </h1>
        <p style="font-size: 12px; color: #ef4444;">This code expires in 15 minutes.</p>
      </div>
    `;
    const result = await sendEmail({ to: email, subject: 'VisageRoute — Password Reset Code', html });
    console.log('✅ Password reset email sent to:', email);
    return result;
  } catch (error) {
    console.error('❌ Password Reset Email Error:', error.message);
    return false;
  }
};

module.exports = { sendRegistrationEmail, sendAnnouncementEmail, sendPasswordResetEmail, sendEmail };
