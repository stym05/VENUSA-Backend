const Customers = require("../models/customers");
const sendOtpEmail = require("../utils/sendEmail");

const otpStore = {}; // Temporary storage (use Redis in production)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 🔹 Register Customer & Send OTP
const registerCustomer = async (req, res) => {
    try {
        const { phone_number } = req.body;
        // Check if customer already exists
        const existingCustomer = await Customers.Customer.findOne({ phone_number });
        if (existingCustomer) return res.status(400).json({ message: "Email already registered!" });

        const otp = generateOTP();
        otpStore[email] = otp; // Store OTP temporarily

        // Send OTP via email (Configure transporter)
        // sendOtpEmail(email, otp);

        // Save unverified customer
        const newCustomer = new Customers.Customer({ email: "example@gmail.com", username: "guest user", phone_number, address: "blank" });
        await newCustomer.save();

        res.status(201).json({ message: "Customer registered. OTP sent to email." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!otpStore[email] || otpStore[email] !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }

        await Customers.Customer.updateOne({ email }, { $set: { isVerified: true } });
        delete otpStore[email]; // Remove OTP

        res.json({ message: "Email verified successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

module.exports = { registerCustomer, verifyOTP, getCustomerById, updateCustomer, deleteCustomer };
