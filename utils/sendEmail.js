const nodemailer = require("nodemailer");
require("dotenv").config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address from environment variable
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });
};

// const sendEmail = async (to, subject, text) => {
//   try {
//     const transporter = createTransporter();

//     const mailOptions = {
//       from: process.env.EMAIL_USER, // Sender address
//       to, // Receiver's email address
//       subject, // Subject line
//       text, // Email body
//     };

//     const info = await transporter.sendMail(mailOptions); // Use sendMail
//     console.log(`Email sent: ${info.response}`);
//     return info;
//   } catch (error) {
//     console.error(`Error sending email: ${error.message}`);
//     throw error;
//   }
// };

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    const info = await transporter.sendMail(mailOptions); // Use sendMail
    console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
