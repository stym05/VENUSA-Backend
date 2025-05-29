const Customers = require("../models/customers");
const sendOtpEmail = require("../utils/sendEmail");
const sendMsgToPhone = require("../utils/sendMsgToPhone");


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 🔹 Register Customer & Send OTP
const registerCustomer = async (req, res) => {
    try {
        const { phone_number } = req.body;
        // Check if customer already exists
        const existingCustomer = await Customers.Customer.findOne({ phone_number });
        if (existingCustomer) return res.status(400).json({ message: "User already registered!" });
        const genratedOtp = generateOTP();
        const newCustomer = new Customers.Customer({ email: "example@gmail.com", username: "guest user", phone_number, address: "blank", otp: genratedOtp });

        const resp = await sendMsgToPhone(phone_number, genratedOtp)
        if (resp.success) {
            await newCustomer.save();
            res.status(201).json({ message: "Customer registered. OTP sent to you phone number." });
        } else {
            res.status(500).json({ error: "OTP not sent" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { phone_number, otp } = req.body;

        const existingCustomer = await Customers.Customer.findOne({ phone_number });
        console.log("existingCustomer is = ", existingCustomer.otp);
        if (existingCustomer.otp && existingCustomer.otp != otp) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }

        await Customers.Customer.updateOne({ phone_number }, { $set: { isPhoneVerified: true } });

        res.json({
            success: true,
            userId: existingCustomer._id,
            message: "Mobile Number verified successfully!",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL Customers

const getCustomer = async (req, res) => {
    try {
        const customer = await Customers.Customer.find();
        if (!customer) return res.status(404).json({ status: 404, success: false, message: "Customer not found!" });

        res.json({
            status: 100, success: true,
            customers: customer
        });
    } catch (error) {
        res.status(500).json({ status: 500, success: false, error: error.message });
    }
};

// 🔹 Get Customer by ID
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customers.Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found!" });

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Update Customer Info
const updateCustomer = async (req, res) => {
    try {
        const { customerId, username, phone_number, address } = req.body;

        const updatedCustomer = await Customers.Customer.findByIdAndUpdate(
            customerId,
            { username, phone_number, address },
            { new: true }
        );

        if (!updatedCustomer) return res.status(404).json({ message: "Customer not found!" });

        res.json({ message: "Customer updated!", customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Delete Customer
const deleteCustomer = async (req, res) => {
    try {
        await Customers.Customer.findByIdAndDelete(req.params.id);
        res.json({ message: "Customer deleted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { registerCustomer, verifyOTP, getCustomerById, updateCustomer, deleteCustomer, getCustomer };
