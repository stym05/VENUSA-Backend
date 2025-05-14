const Product = require("../models/products");
const Category = require("../models/categories");
const fs = require("fs");
const path = require("path");
const s3 = require("../config/digitalOceanStorage");

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

        // Generate image URLs directly from the uploaded files
        const images = req.files.map(file => file.location); // Multer-S3 provides the URL in `file.location`

        // Create product and save
        const product = new Product({ 
            name, 
            description, 
            price, 
            subcategory, 
            images, 
            colors: parsedColors, 
            stock: parsedStock 
        });
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
            // Delete old images from DigitalOcean Spaces (optional)
            if (images && images.length > 0) {
                for (const imageUrl of images) {
                    try {
                        const fileName = imageUrl.split("/").pop();
                        const params = {
                            Bucket: process.env.DO_SPACE_NAME,
                            Key: `images/${fileName}`,
                        };
                        await s3.deleteObject(params).promise();
                    } catch (err) {
                        console.error("Error deleting old image from Space:", err);
                    }
                }
            }

            // Store new images from req.files
            images = req.files.map(file => file.location); // Directly get URLs from Multer-S3
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

exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find the product before deleting to access its images
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Delete images from DigitalOcean Spaces
        if (product.images && product.images.length > 0) {
            for (const imageUrl of product.images) {
                try {
                    // Extract the filename from the URL
                    const fileName = imageUrl.split("/").pop();
                    const params = {
                        Bucket: process.env.DO_SPACE_NAME,
                        Key: `images/${fileName}`,
                    };
                    await s3.deleteObject(params).promise();
                    console.log(`Deleted: ${fileName} from DigitalOcean Space`);
                } catch (err) {
                    console.error("Error deleting image from Space:", err.message);
                }
            }
        }

        // Delete the product from the database
        await product.deleteOne();

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
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

