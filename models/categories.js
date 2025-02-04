const mongoose = require('mongoose');
const { Schema } = mongoose;

// Category Schema (e.g., Men, Women)
const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    bannerImage: { type: String},
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }], // References SubCategory
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

// SubCategory Schema (e.g., Shirts, T-Shirts, Pants)
const SubCategorySchema = new Schema({
    name: { type: String, required: true },
    image: { type:  String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // References Category
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // References Product
}, { timestamps: true });

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = { Category, SubCategory };
