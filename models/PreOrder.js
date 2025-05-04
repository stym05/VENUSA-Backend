const mongoose = require('mongoose');
const { Schema } = mongoose;

const PreOrderSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
        size: { type: String, required: true }, // Selected size (e.g., "M", "L", "XL")
        color: { type: String, required: false }, // Number of items for this size,
        quantity: { type: Number, require: true, default: 1 },
        price: { type: Number, require: true }
    }]
}, { timestamps: true });

const PreOrder = mongoose.model('PreOrder', PreOrderSchema);
module.exports = PreOrder;
