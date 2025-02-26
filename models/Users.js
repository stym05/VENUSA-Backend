const mongoose = require('mongoose');
const { Schema } = mongoose;

// Customer Schema (Equivalent to Django's AbstractUser-based Customer Model)
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, maxlength: 15, required: true, unique: true },
    isAdmin: {type: Boolean, default: false },
    address: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false }, // Tracks email verification status
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String, default: null }, // Store OTP temporarily if needed
}, { timestamps: true });

const Users = mongoose.model('Users', UserSchema);

module.exports = { Users };