const Product = require("../models/products");
const Category = require("../models/categories");
const fs = require("fs");
const path = require("path");
const s3 = require("../config/digitalOceanStorage");
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { SubCategory } = Category;


exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, subcategory, colors, stock } = req.body;

        // Ensure between 4 and 6 images are uploaded
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

        // Upload images to DigitalOcean Spaces
        const images = [];
        for (const file of req.files) {
            const fileName = `product-${Date.now()}-${file.originalname}`;
            const key = `images/${fileName}`;

            const params = {
                Bucket: process.env.DO_SPACE_NAME,
                Key: key,
                Body: file.buffer,
                ACL: "public-read",
                ContentType: file.mimetype,
            };

            try {
                const command = new PutObjectCommand(params);
                await s3.send(command);

                const imageUrl = `${process.env.BUCKET_URL}/${key}`;
                images.push(imageUrl);
            } catch (err) {
                console.error("Error uploading product image:", err.message);
                return res.status(500).json({ success: false, message: "Failed to upload product images" });
            }
        }

        // Create and save product
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

        // Link product to SubCategory
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

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Parse colors and stock
        try {
            if (colors) colors = JSON.parse(colors);
            if (stock) stock = JSON.parse(stock);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid JSON format for colors or stock" });
        }

        // Handle image replacement
        let images = product.images;

        if (req.files && req.files.length > 0) {
            // Delete old images
            for (const imageUrl of images) {
                const fileName = imageUrl.split("/").pop();
                const deleteParams = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: `images/${fileName}`
                };
                try {
                    await s3.send(new DeleteObjectCommand(deleteParams));
                } catch (err) {
                    console.error("Failed to delete image:", err.message);
                }
            }

            // Upload new images
            images = [];
            for (const file of req.files) {
                const fileName = `product-${Date.now()}-${file.originalname}`;
                const key = `images/${fileName}`;

                const uploadParams = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: key,
                    Body: file.buffer,
                    ACL: "public-read",
                    ContentType: file.mimetype,
                };

                try {
                    await s3.send(new PutObjectCommand(uploadParams));
                    const imageUrl = `${process.env.BUCKET_URL}/${key}`;
                    images.push(imageUrl);
                } catch (err) {
                    console.error("Failed to upload image:", err.message);
                    return res.status(500).json({ success: false, message: "Image upload failed" });
                }
            }
        }

        // Check if subcategory was changed
        if (subcategory && subcategory !== product.subcategory.toString()) {
            const exists = await SubCategory.findById(subcategory);
            if (!exists) {
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

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Delete associated images from Space
        if (product.images && product.images.length > 0) {
            for (const imageUrl of product.images) {
                const fileName = imageUrl.split("/").pop();
                const params = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: `images/${fileName}`
                };

                try {
                    await s3.send(new DeleteObjectCommand(params));
                    console.log(`Deleted: ${fileName}`);
                } catch (err) {
                    console.error(`Error deleting ${fileName}:`, err.message);
                }
            }
        }

        // Remove product
        await product.deleteOne();

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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

