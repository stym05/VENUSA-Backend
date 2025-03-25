const Product = require("../models/products");
const Category = require("../models/categories");
const fs = require("fs");
const path = require("path");

const { SubCategory } = Category;


exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, subcategory, colors, stock } = req.body;

        // Ensure at least 4 images but no more than 6
        if (!req.files || req.files.length < 4 || req.files.length > 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload between 4 to 6 images" 
            });
        }

        // Check if subcategory exists
        const subCategoryExists = await SubCategory.findById(subcategory);
        if (!subCategoryExists) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        // Parse JSON fields safely
        let parsedColors, parsedStock;
        try {
            parsedColors = JSON.parse(colors);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid colors format" });
        }

        try {
            parsedStock = JSON.parse(stock);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid stock format" });
        }

        // Create product first to get its _id
        const product = new Product({ 
            name, 
            description, 
            price, 
            subcategory, 
            images: [], 
            colors: parsedColors, 
            stock: parsedStock 
        });
        await product.save();

        // Sanitize product name for folder creation
        const sanitizedProductName = name.toLowerCase().replace(/\s+/g, "-");
        const productFolder = path.join("uploads", `${sanitizedProductName}_${product._id}`);

        // Create folder if it doesn't exist
        if (!fs.existsSync(productFolder)) {
            fs.mkdirSync(productFolder, { recursive: true });
        }

        // Move uploaded files to product-specific folder and store full URLs
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const images = await Promise.all(req.files.map(async (file) => {
            const newFilePath = path.join(productFolder, file.filename);
            await fs.promises.rename(file.path, newFilePath); // Move file safely
            return `${baseUrl}/${newFilePath.replace(/\\/g, "/")}`; // Full URL
        }));

        // Update product with image paths
        product.images = images;
        await product.save();

        // Add product reference to SubCategory
        await SubCategory.findByIdAndUpdate(subcategory, { $push: { products: product._id } });

        res.status(201).json({ success: true, message: "Product created successfully", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        let { name, description, price, subcategory, colors, stock } = req.body;

        // Find the product first
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Parse JSON fields safely
        try {
            if (colors) colors = JSON.parse(colors);
            if (stock) stock = JSON.parse(stock);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid JSON format for colors or stock" });
        }

        // Handle image updates
        let images = product.images; // Keep existing images if no new images are uploaded

        if (req.files && req.files.length > 0) {
            const sanitizedProductName = product.name.toLowerCase().replace(/\s+/g, "-");
            const productFolder = path.join("uploads", `${sanitizedProductName}_${product._id}`);

            // Create folder if it doesn't exist
            if (!fs.existsSync(productFolder)) {
                fs.mkdirSync(productFolder, { recursive: true });
            }

            // Delete old images if new ones are uploaded
            for (const image of product.images) {
                const oldImagePath = path.join(__dirname, "..", image);
                try {
                    if (fs.existsSync(oldImagePath)) {
                        await fs.promises.unlink(oldImagePath);
                    }
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }

            // Move new images and update image paths
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            images = await Promise.all(req.files.map(async (file) => {
                const newFilePath = path.join(productFolder, file.filename);
                await fs.promises.rename(file.path, newFilePath); // Move file safely
                return `${baseUrl}/${newFilePath.replace(/\\/g, "/")}`; // Full URL
            }));
        }

        // Check if subcategory exists (if changed)
        if (subcategory && subcategory !== product.subcategory.toString()) {
            const subCategoryExists = await SubCategory.findById(subcategory);
            if (!subCategoryExists) {
                return res.status(404).json({ success: false, message: "New SubCategory not found" });
            }
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, description, price, subcategory, colors, stock, images },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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
        let { stock } = req.body; // Expected: Array of { size, quantity }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Parse stock if it's sent as a string
        try {
            if (typeof stock === "string") {
                stock = JSON.parse(stock);
            }
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid stock format" });
        }

        // Validate stock format
        if (!Array.isArray(stock) || !stock.every(item => item.size && typeof item.quantity === "number")) {
            return res.status(400).json({ success: false, message: "Stock must be an array of objects with size and quantity" });
        }

        // Update product stock
        product.stock = stock;
        await product.save();

        res.status(200).json({ success: true, message: "Stock updated successfully", product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating stock", error: error.message });
    }
};

