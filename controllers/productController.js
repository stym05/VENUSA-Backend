const Product = require("../models/products");
const Category = require("../models/categories");

const { SubCategory } = Category;

// ✅ Create a new Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, subcategory, images, colors, stock } = req.body;

        // Check if SubCategory exists
        const subCategoryExists = await SubCategory.findById(subcategory);
        if (!subCategoryExists) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        const product = new Product({ name, description, price, subcategory, images, colors, stock });
        await product.save();

        // Add product reference to SubCategory
        await SubCategory.findByIdAndUpdate(subcategory, { $push: { products: product._id } });

        res.status(201).json({ success: true, message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating product", error: error.message });
    }
};

// ✅ Get all Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("subcategory");
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
};

// ✅ Get a single Product by ID
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId).populate("subcategory");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching product", error: error.message });
    }
};

// ✅ Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product updated successfully", updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating product", error: error.message });
    }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting product", error: error.message });
    }
};

// ✅ Get Products by SubCategory
exports.getProductsBySubCategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const products = await Product.find({ subcategory: subcategoryId });

        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
};

// ✅ Update Stock
exports.updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body; // Array of { size, quantity }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.stock = stock; // Replace stock array
        await product.save();

        res.status(200).json({ success: true, message: "Stock updated successfully", product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating stock", error: error.message });
    }
};
