const mongoose = require('mongoose');
const { Schema } = mongoose;

// Customer Schema (Equivalent to Django's AbstractUser-based Customer Model)
const CustomerSchema = new Schema({
    username: { type: String, required: false, unique: false },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, maxlength: 15, required: true, unique: true },
    address: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false }, // Tracks email verification status
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String, default: null }, // Store OTP temporarily if needed
}, { timestamps: true });

const Customer = mongoose.model('Customer', CustomerSchema);

// Address Schema
const AddressSchema = new Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // ForeignKey equivalent
    street_address: { type: String, required: true },
    city: { type: String, required: true, maxlength: 100 },
    state: { type: String, required: true, maxlength: 100 },
    postal_code: { type: String, required: true, maxlength: 20 },
    country: { type: String, required: true, maxlength: 100, default: "india" },
    is_default: { type: Boolean, default: false },
    mobile_number: { type: String, maxlength: 15, default: null },
    alternate_mobile_number: { type: String, maxlength: 15, default: null },
}, {
    timestamps: true
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = { Customer, Address };
