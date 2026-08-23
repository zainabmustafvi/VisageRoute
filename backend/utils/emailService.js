const sendEmail = require('./sendEmail');
const transporter = sendEmail.transporter;

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
