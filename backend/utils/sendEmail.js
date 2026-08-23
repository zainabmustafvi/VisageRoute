require('dotenv').config();
const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER || process.env.MAILTRAP_USER;
const smtpPass = process.env.SMTP_PASS || process.env.MAILTRAP_PASS;

if (!smtpUser || !smtpPass) {
  console.error('❌ CRITICAL ERROR: SMTP_USER or SMTP_PASS environment variables are missing!');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT || process.env.MAILTRAP_PORT) || 2525,
  secure: (process.env.SMTP_PORT === '465' || process.env.MAILTRAP_PORT === '465'), // true for 465, false for 2525/587
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection on boot
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
  } else {
    console.log('✅ Mailtrap SMTP Connected Successfully!');
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VisageRoute Admin" <no-reply@visageroute.com>',
      to: to,
      subject: subject,
      text: text,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
module.exports.transporter = transporter;
module.exports.sendEmail = sendEmail;
