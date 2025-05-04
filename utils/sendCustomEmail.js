const nodemailer = require('nodemailer');
// require("dotenv").config({ path: "../.env" });

// Send OTP via email
const sendCustomMail = async (email, subject, html, data) => {

  console.log("auth = ", {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  })
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465, // Secure port for SMTP (SSL)
    secure: true, // Use SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    },
    logger: true,
    debug: true
  });
  

  const mailOptions = {
    from:  `VENUSA ${process.env.GMAIL_USER}`,
    to: email,
    subject: subject,
    html: html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email: ', error);
  }
};

module.exports = sendCustomMail;
// sendOtpEmail("satyamshady005@gmail.com", 854125)