const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
        image: { type: String, required: true },
        size: { type: String, required: true }, // Selected size (e.g., "M", "L", "XL")
        quantity: { type: Number, required: true, default: 1 }, // Number of items for this size
        price: { type: Number, required: true } // Price per unit (store in case price changes later)
    }]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
