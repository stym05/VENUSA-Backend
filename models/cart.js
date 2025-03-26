const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
        size: { type: String, required: true }, // Selected size (e.g., "M", "L", "XL")
        color: { type: String, required: true }, // Number of items for this size
    }]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
