const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
        quantity: { type: Number, required: true, default: 1 }, // Quantity of the product in the order
        price: { type: Number, required: true }, // Price of the product at the time of order
        size: { type: String, required: true }, // Size of the product
        color: { type: String, required: true } // Color of the product
    }],
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true }, // References Address
    billingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true }, // References Address
    trackingNumber: { type: String, unique: true }, // Unique tracking number for the order
    discount_applied: { type: Number, default: 0 }, // Discount applied to the order
    taxAmount: { type: Number, default: 0 }, // Tax amount for the order
    totalAmount: { type: Number, required: true }, // Total order price
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    transactionDate: { type: Date, default: Date.now },
  
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    deliveredAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
