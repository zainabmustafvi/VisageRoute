const nodemailer = require('nodemailer');

const sendRegistrationEmail = async (email, name, userId, password) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '2525'),
            secure: process.env.SMTP_PORT == '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Do not fail on invalid certs (common for testing/dev)
                rejectUnauthorized: false
            }
        });

        console.log('Attempting to send email via:', process.env.SMTP_HOST);

        const mailOptions = {
            from: `"VisageRoute Admin" <noreply@visageroute.com>`, // Changed to a generic noreply address
            to: email,
            subject: 'Your VisageRoute Registration Details',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #f2cc0d;">Welcome to VisageRoute, ${name}!</h2>
                    <p>Your administrative registration is complete. You can now log in to the portal using the following credentials:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>User ID (Email):</strong> ${userId}</p>
                        <p><strong>Password:</strong> <span style="color: #e74c3c;">${password}</span></p>
                    </div>
                    <p>Please change your password after your first login for security purposes.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply directly to this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully! ID: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email Service Error:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);
        return false;
    }
};

const sendAnnouncementEmail = async (email, title, content, priority) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '2525'),
            secure: process.env.SMTP_PORT == '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: `"VisageRoute Notifications" <noreply@visageroute.com>`,
            to: email,
            subject: `${priority === 'urgent' ? '[URGENT] ' : ''}${title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: ${priority === 'urgent' ? '#e74c3c' : '#f2cc0d'};">${title}</h2>
                    <p style="white-space: pre-line;">${content}</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #777;">This is an official announcement from the school transport administrator.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('❌ Announcement Email Error:', error.message);
        return false;
    }
};

module.exports = { sendRegistrationEmail, sendAnnouncementEmail };
