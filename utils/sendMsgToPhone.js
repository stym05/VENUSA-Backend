const dotenv = require("dotenv");
dotenv.config();  // ✅ Load environment variables first

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; // Check the variable name
const client = require('twilio')(accountSid, authToken);

const sendMsgToPhone = async () => {
    try {
        const verification = await client.verify.v2.services("VA238c5c61ba68fb45453a16bdefc42eae")
            .verifications
            .create({ to: '+919897144223', channel: 'sms' });

        console.log("OTP Sent Successfully. Verification SID:", verification.sid);
    } catch (error) {
        console.error("Error sending OTP:", error.message);
    }
}

sendMsgToPhone();
