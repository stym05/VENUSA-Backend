const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // References Product
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating from 1 to 5
    comment: { type: String, required: true }, // Review text
    images: [{ type: String }], // Array of image URLs
    createdAt: { type: Date, default: Date.now }
});
    
const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
