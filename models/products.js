const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },  // for detailed product description
    key_features: [{ type: String , required: false }], // for key features of the product
    price: { type: Number, required: true },
    material: { type: String, required: true }, // Material of the product
    sku: { type: String, required: true, unique: true }, // Stock Keeping Unit
    tags: [{ type: String }], // Array of tags for the product
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // References Category
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true }, // References SubCategory
    discount: { type: Number, default: 0 }, // Discount percentage
    images: [{ type: String }], // Array of image URLs
    stock: [{
        size: { type: String, required: true }, // e.g., "S", "M", "L", "XL"
        quantity: { type: Number, required: true, default: 0 }, // Stock for this size
        color: { type: String, required: true } // Color of the product
    }],
    rating: {
        averageRating: { type: Number, default: 0, min: 0, max: 5 }, // Average rating (0 to 5)
        totalRating: { type: Number, default: 0 } // Total number of reviews
    },
    isActive: { type: Boolean, default: true }, // Indicates if the product is active
    totalSales: { type: Number, default: 0 }, // Number of times product has been sold
}, { timestamps: true });


const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;