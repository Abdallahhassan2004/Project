const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'Outlook', 'SendGrid', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app-specific password
    }
});

const sendPasswordResetEmail = async (email, resetUrl) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully to:', email);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

module.exports = { sendPasswordResetEmail }; 