const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.NODEMAILER_EMAIL, pass: process.env.NODEMAILER_PASSWORD }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({ from: 'PetWell', to, subject, html });
};

module.exports = { sendEmail };