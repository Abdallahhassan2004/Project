const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Check if SendGrid API key is available
if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    process.exit(1);
}

// Check if sender email is available
if (!process.env.EMAIL_USER) {
    console.error('❌ EMAIL_USER not found in environment variables');
    process.exit(1);
}

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - Password reset URL
 */
exports.sendPasswordResetEmail = async (to, resetUrl) => {
  try {
    const msg = {
      to: to,
      from: process.env.EMAIL_USER, // Use your verified email as sender
      subject: 'Password Reset Request - Your E-commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password for your account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from your e-commerce store. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await sgMail.send(msg);
    return true;
    
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    return false;
  }
}; 