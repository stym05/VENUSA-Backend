const mongoose = require("mongoose");
const { Category } = require("../models/categories");
const s3 = require('../config/digitalOceanStorage'); // S3 instance
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// ✅ Create Category
exports.createCategory = async (req, res) => {
    try {
        let { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        name = name.trim().toLowerCase();

        // Check for duplicate category
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        // Handle image upload to DigitalOcean Spaces
        let image = null;
        if (req.file) {
            const fileName = `category-${Date.now()}-${req.file.originalname}`;
            const key = `images/${fileName}`;

            const uploadParams = {
                Bucket: process.env.DO_SPACE_NAME,
                Key: key,
                Body: req.file.buffer,
                ACL: "public-read",
                ContentType: req.file.mimetype,
            };

            try {
                await s3.send(new PutObjectCommand(uploadParams));
                image = `${process.env.BUCKET_URL}/${key}`;
            } catch (err) {
                console.error("Image upload failed:", err.message);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        const category = new Category({ name, image });
        await category.save();

        res.status(201).json({ success: true, message: "Category created successfully", category });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Get all Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
    }
};

// ✅ Get a single Category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId).populate("subcategories");

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching category", error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        let updates = { ...req.body };

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Normalize name and check for duplicates
        if (updates.name) {
            updates.name = updates.name.trim().toLowerCase();
            const existingCategory = await Category.findOne({ name: updates.name });
            if (existingCategory && existingCategory._id.toString() !== categoryId) {
                return res.status(400).json({ success: false, message: "Category name already exists" });
            }
        }

        // Handle image update
        if (req.file) {
            const fileName = `category-${Date.now()}-${req.file.originalname}`;
            const key = `images/${fileName}`;

            const uploadParams = {
                Bucket: process.env.DO_SPACE_NAME,
                Key: key,
                Body: req.file.buffer,
                ACL: "public-read",
                ContentType: req.file.mimetype,
            };

            try {
                await s3.send(new PutObjectCommand(uploadParams));
                updates.image = `${process.env.BUCKET_URL}/${key}`; 
            } catch (err) {
                console.error("Image upload failed:", err.message);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }

            // Delete old image from Space
            if (category.image) {
                const oldFileName = category.image.split("/").pop();
                const deleteParams = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: `images/${oldFileName}`,
                };
                try {
                    await s3.send(new DeleteObjectCommand(deleteParams));
                } catch (err) {
                    console.error("Failed to delete old image from Space:", err.message);
                }
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

        res.status(200).json({ success: true, message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Find the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Delete the image from DigitalOcean Space (if exists)
        if (category.image) {
            const imageKey = category.image.split("/").pop();
            const deleteParams = {
                Bucket: process.env.DO_SPACE_NAME,
                Key: `images/${imageKey}`,
            };

            try {
                await s3.send(new DeleteObjectCommand(deleteParams));
                console.log(`Image deleted from Space: ${imageKey}`);
            } catch (err) {
                console.error("Error deleting image from Space:", err.message);
            }
        }

        // Delete the category document
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
    }
};
