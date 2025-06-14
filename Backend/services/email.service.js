const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"PetWell" <${process.env.NODEMAILER_EMAIL}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
      from: `"PetWell" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Verify Your PetWell Account',
      html: `<p>Please verify your email by clicking the link below:</p>
             <a href="${verificationUrl}">Verify Email</a>
             <p>This link expires in 2 hours.</p>`
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"PetWell" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Reset Your PetWell Password',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetUrl}">Reset Password</a>
             <p>This link expires in 2 hours.</p>`
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };