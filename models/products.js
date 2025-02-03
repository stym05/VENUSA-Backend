const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true }, // References SubCategory
    images: [{ type: String }], // Array of image URLs
    colors: [{ type: String }], // e.g., ["Red", "Blue", "Black"]
    stock: [{
        size: { type: String, required: true }, // e.g., "S", "M", "L", "XL"
        quantity: { type: Number, required: true, default: 0 } // Stock for this size
    }],
    rating: {
        averageRating: { type: Number, default: 0, min: 0, max: 5 }, // Average rating (0 to 5)
        totalReviews: { type: Number, default: 0 } // Total number of reviews
    },
    totalSales: { type: Number, default: 0 }, // Number of times product has been sold
}, { timestamps: true });


const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;