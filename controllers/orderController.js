// import Razorpay from "razorpay";
// import crypto from "crypto";
// import config from "../config/config";

const PreOrder = require("../models/PreOrder");
const { Users } = require("../models/Users");
const { Customer } = require("../models/customers");
const Order = require("../models/orders");
const sendCustomMail = require("../utils/sendCustomEmail");
const { ObjectId } = mongoose.Types;


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

        const user = await Customer.findOne({ _id: new ObjectId(userId) });

        const { email, username } = user;

        await preOrder.save();
        await sendPreOderConfirmationMail(username, "abhi2907singh@gmail.com");
        res.status(200).json({ success: true, code: 100, message: 'Product added to preOrder', preOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}


const sendPreOderConfirmationMail = async (name, email) => {
    try {
        const html =
            `    
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Welcome to Venusa</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 30px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                      <tr>
                        <td align="center" style="font-size: 26px; font-weight: bold; color: #000000; padding-bottom: 10px;">
                          Welcome to Venusa 💌
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 16px; color: #333333; line-height: 1.6;">
                          <p>Hey <strong>${name}</strong>,</p>
                          <p>We’re so glad you’re here! 💖 You’ve just joined <strong>Venusa</strong> — a space where <em>style meets soul</em> and every piece tells a story.</p>
                          <p>Whether you're here to explore, shop, or simply vibe with us — we’re all about keeping it bold, expressive, and unapologetically you.</p>
                          <p>🔥 Expect exclusive updates, early access to drops, and more coming your way soon!</p>
                          <p>In the meantime, dive into our world:<br>
                            <a href="https://www.instagram.com/venusa.co.in" style="color: #e91e63; text-decoration: none;">@venusa.co.in</a> | 
                            <a href="https://www.venusa.co.in" style="color: #e91e63; text-decoration: none;">venusa.co.in</a>
                          </p>
                          <p style="margin-top: 30px;">Let’s make something unforgettable.<br><strong>– Team Venusa</strong><br><em>Born to stand out.</em></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `

        await sendCustomMail(email, "VENUSA PreOrder Confirmation", html);
    } catch (err) {
        console.log(err);
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