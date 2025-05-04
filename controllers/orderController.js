// import Razorpay from "razorpay";
// import crypto from "crypto";
// import config from "../config/config";
// import Order from "../models/orders";
// import PreOrder from "../models/PreOrder";

const PreOrder = require("../models/PreOrder");
const Order = require("../models/orders");





const CreatePreOrder = async (req, res) => {
    try {
        const { userId, productId, size, color } = req.body;
        let preOrder = await PreOrder.findOne({ user: userId });

        if (!preOrder) {
            preOrder = new PreOrder({ user: userId, products: [{ product: productId, size, color }] });
        } else {
            const existingProduct = preOrder.products.find(item => item.product.toString() === productId && item.size === size);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                preOrder.products.push({ product: productId, size, color });
            }
        }

        await preOrder.save();
        res.status(200).json({ success: true, code: 100, message: 'Product added to preOrder', preOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}


const CreateOrder = async (req, res) => {
    const { userId, cartId, amount } = req.body;

    try {
        const razorpay = new Razorpay({
            key_id: config.razorpay_key_id,
            key_secret: config.razorpay_key_secret,
        });
        const shortReceipt =
            `${userId}`.slice(0, 20) + `_${cartId}`.slice(0, 19);
        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: shortReceipt,
        });

        const transaction = new Order({
            user: userId,
            courseId,
            amount,
            razorpayOrderId: order.id,
            transactionStatus: "Pending",
        });

        await transaction.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = { CreatePreOrder, CreateOrder };