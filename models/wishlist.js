const mongoose = require('mongoose');
const { Schema } = mongoose;

const WishlistSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
        addedAt: { type: Date, default: Date.now } // Timestamp when added
    }]
}, { timestamps: true });

const Wishlist = mongoose.model('Wishlist', WishlistSchema);
module.exports = Wishlist;
