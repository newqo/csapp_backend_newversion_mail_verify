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
    user: 'worawit.forstudy@gmail.com', 
    pass: 'licb wiqb oxuu uuvr' 
  }
});

module.exports = { transporter };