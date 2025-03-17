// for development time
// require("dotenv").config({ path: "../.env" });


const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN


const client = require('twilio')(accountSid, authToken);

const sendMsgToPhone = async (to, msg) => {
    try {
        const verification = await client.messages.create({
            body: `Your Varification OTP : ${msg}`,
            from: "+16267885323",
            to: `+91${to}`  // this is only for india
        });

        console.log("OTP Sent Successfully. Verification SID:", verification.sid);
        return {
            success: true
        }
    } catch (error) {
        console.error("Error sending OTP:", error.message);
        return {
            success: false
        }
    }
}


module.exports = sendMsgToPhone;
// sendMsgToPhone(6281506394, 562535);