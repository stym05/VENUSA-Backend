const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
        size: { type: String, required: true }, // Selected size (e.g., "M", "L", "XL")
        quantity: { type: Number, required: true }, // Number of items for this size
        price: { type: Number, required: true } // Price per unit at time of purchase
    }],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        mobileNumber: { type: String, required: true }
    },
    totalAmount: { type: Number, required: true }, // Total order price
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    paymentMethod: { type: String, enum: ["COD", "Credit Card", "Debit Card", "UPI"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    trackingNumber: { type: String, default: null }, // Optional tracking number
    placedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
