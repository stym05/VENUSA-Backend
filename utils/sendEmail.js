const nodemailer = require('nodemailer');
// require("dotenv").config({ path: "../.env" });

// Send OTP via email
const sendOtpEmail = async (email, otp) => {

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
    subject: `VENUSA OTP is: ${otp}`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 50px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .logo {
      width: 120px;
      margin-bottom: 20px;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #2d89ff;
      background: #f3f7ff;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      font-size: 14px;
      color: #777;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="${process.env.VENUSA_LOGO}" alt="Company Logo">
    <h2>OTP Verification</h2>
    <p>Your One-Time Password (OTP) for verification is:</p>
    <div class="otp">123456</div>
    <p>This OTP is valid for the next <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p>If you did not request this OTP, please ignore this email.</p>
    <div class="footer">© 2025 Venusa. All rights reserved.</div>
  </div>
</body>
</html>
`.replace("123456", otp),
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email: ', error);
  }
};

module.exports = sendOtpEmail;
// sendOtpEmail("satyamshady005@gmail.com", 854125)