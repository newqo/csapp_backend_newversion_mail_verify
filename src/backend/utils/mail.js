const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'example@email.com', 
    pass: 'mail_app_password' 
  }
});

module.exports = { transporter };