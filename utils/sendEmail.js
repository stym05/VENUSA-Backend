const nodemailer = require('nodemailer');

// Send OTP via email
const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        },
        logger: true,
        debug: true
    });

    verificationUrl = ""

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking on the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP email: ', error);
    }
};

module.exports = sendOtpEmail;