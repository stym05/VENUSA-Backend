const mongoose = require("mongoose");
const { Category } = require("../models/categories");
const s3 = require('../config/digitalOceanStorage'); // S3 instance

// ✅ Create Category
exports.createCategory = async (req, res) => {
    try {
        let { name } = req.body;

        // Validate category name
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        name = name.trim().toLowerCase(); // Normalize name for consistency

        // Get image URL from multer-s3
        const image = req.file ? req.file.location : null;

        // Check for existing category with the same name
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        // Create and save category
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

        // Handle image update (if provided)
        if (req.file) {
            updates.image = req.file.location;

            // Delete old image from DigitalOcean Space if it exists
            if (category.image) {
                const imageKey = category.image.split('/').pop();
                await s3.deleteObject({
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: `images/${imageKey}`,
                }).promise();
            }
        }

        // Update the category
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

        // Fetch the category to check if there's an image to delete
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Delete the image from DigitalOcean Space (if it exists)
        if (category.image) {
            const imageKey = category.image.split('/').pop();
            await s3.deleteObject({
                Bucket: process.env.DO_SPACE_NAME,
                Key: `images/${imageKey}`,
            }).promise();
        }

        // Delete the category
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
    }
};
