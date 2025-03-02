const jwt = require('jsonwebtoken');
const { Users } = require('../models/Users');
const sendOtpEmail = require('../utils/sendEmail');
const sendMsgToPhone = require('../utils/sendMsgToPhone');
const { isEmailValid, validatePhonetNumber } = require('../utils');

const loginUser = async (req, res) => {
    try {
        const { userName } = req.body;
        let user;
        if (isEmailValid(userName)) {
            user = await Users.findOne({ email: userName });
        } else {
            user = await Users.findOne({ phone_number: userName });
        }
        if (!user) {
            return res.status(401).json({ 
                success: false,
                msg: "Invalid userName",
                error: 'User not found'
            });
        }
        const otp = Math.floor(100000 + Math.random() * 900000)
        await Users.updateOne({ _id: user._id}, { $set: { otp: otp } });
        console.log(user)
        if (isEmailValid(userName)) {
            await sendOtpEmail(userName, otp);
        } else {
            await sendMsgToPhone(userName, otp);
        }
        return res.status(200).json({
                success: true,
                code: 200,
                userId: user._id
        });

    } catch (err) {
        console.log("Error in loginCustomer method ::", err);
        res.status(401).json({ error: err })
    }
}

const validateOTPforUsers = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await Users.findOne({ _id: userId });
        if(otp == user.otp) {
            if(!user.isPhoneVerified || !user.isEmailVerified) {
                Users.updateOne({ _id: user._id }, { $set : { isPhoneVerified: true, isEmailVerified: true } })
            }
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET_KEY
            );
            await Users.updateOne({ _id: user._id }, { $set: { otp: null } })
            return res.status(200).json({
                success: true,
                code: 200,
                msg: "authentication success",
                user,
                authToken: token
            })
        } else {
            return res.status(400).json({
                success: 400,
                msg: "wrong otp. please try again"
            })
        }
    } catch (err) {
        console.log("Error in validateOTPforUsers method ::", err);
        return res.status(401).json({ error: err })
    }
}


const createUser = async (req, res) => {
    try {
        console.log(req);
        const {
            email,
            phone_number,
            isAdmin,
            address,
        } = req.body;
        console.log("const data is ", {
            email,
            phone_number,
            isAdmin,
            address,
        })
        if(!isEmailValid(email) || !validatePhonetNumber(phone_number)) {
            res.status(401).json({ error: "phone number or email is not valid" })
        }
        const user = new Users({email, phone_number, isAdmin, address });
        await user.save();
        res.status(200).json({
            success: true,
            userId: user._id,
            msg: "user created successfully please validate email and phone number"
        })
    }catch(err) {
        console.log("error", err);
        res.status(400).json({
            error: err
        })
    }
}

module.exports = { loginUser, validateOTPforUsers, createUser };