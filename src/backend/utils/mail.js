const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'hotmail',
//   auth: {
//     user: 'example@email.com', 
//     pass: 'mail_app_password' 
//   }
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gmail', 
    pass: 'apppassword' 
  }
});

module.exports = { transporter };