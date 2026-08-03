const nodemailer = require('nodemailer');

// Send via Mailtrap HTTP API (https://send.api.mailtrap.io/api/send)
// This bypasses SMTP entirely, avoiding Railway's outbound SMTP port firewall.
const sendEmailViaAPI = async ({ to, subject, html, text }) => {
  const token = process.env.MAILTRAP_TOKEN || process.env.SMTP_PASS;

  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: 'info@visageroute.com', name: 'VisageRoute' },
      to: [{ email: to }],
      subject,
      text: text || '',
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Mailtrap API error ${response.status}: ${JSON.stringify(data)}`);
  }
  console.log('✅ Email sent via Mailtrap HTTP API:', data);
  return data;
};

// Create a shared SMTP transporter with explicit timeouts to prevent hanging connections
const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525, // Port 2525 or 587 are NOT blocked by Railway
    secure: process.env.SMTP_PORT == '465', // true for 465, false for 2525 / 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // Explicit timeouts to prevent long hangs / Railway 499 (request timeout) errors
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 10000,     // 10s for socket inactivity
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection configuration on backend boot (SMTP path only)
const transporter = createTransporter();
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️ SMTP verify failed (will fall back to HTTP API):', error.message);
    } else {
        console.log('✅ Mailtrap SMTP Server connected successfully on port', process.env.SMTP_PORT || 2525);
    }
});

// Generic sendMail: try SMTP first, fall back to the Mailtrap HTTP API on failure
const sendMail = async ({ to, subject, html, text }) => {
    try {
        const smtpTransporter = createTransporter();
        const info = await smtpTransporter.sendMail({
            from: '"VisageRoute" <noreply@visageroute.com>',
            to,
            subject,
            text: text || '',
            html,
        });
        console.log('✅ Email sent via SMTP! ID: %s', info.messageId);
        return true;
    } catch (smtpError) {
        // Log SMTP failure details for debugging
        console.error('⚠️ SMTP failed, falling back to HTTP API. Error:', smtpError.message);
        if (smtpError.code) console.error('SMTP Error Code:', smtpError.code);
        if (smtpError.command) console.error('Failed SMTP Command:', smtpError.command);
        if (smtpError.response) console.error('SMTP Response:', smtpError.response);

        // Fallback: send via Mailtrap HTTP API
        try {
            await sendEmailViaAPI({ to, subject, html, text });
            return true;
        } catch (apiError) {
            console.error('❌ Mailtrap API Error:', apiError.message);
            return false;
        }
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
        return await sendMail({
            to: email,
            subject: 'Your VisageRoute Registration Details',
            html,
        });
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
        return await sendMail({
            to: email,
            subject: `${priority === 'urgent' ? '[URGENT] ' : ''}${title}`,
            html,
        });
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
        const result = await sendMail({
            to: email,
            subject: 'VisageRoute — Password Reset Code',
            html,
        });
        if (result) console.log('✅ Password reset email sent to:', email);
        return result;
    } catch (error) {
        console.error('❌ Password Reset Email Error:', error.message);
        return false;
    }
};

module.exports = { sendRegistrationEmail, sendAnnouncementEmail, sendPasswordResetEmail };
