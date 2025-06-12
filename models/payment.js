const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TransactionsSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // References Order
    paymentMethod: {
        type: String,
        required: true,
        default: "Razorpay",
        enum: ["Razorpay", "PayPal", "Stripe", "Cash on Delivery"] // Supported payment methods
    },
    amount: { type: Number, required: true }, // Amount paid
    transactionId: { type: String, unique: true, required: true }, // Unique transaction ID
    status: {
        type: String,
        enum: ["Success", "Failed", "Pending"],
        default: "Pending"
    }
}, { timestamps: true });

const Transactions = mongoose.model('Transactions', TransactionsSchema);
module.exports = Transactions;
