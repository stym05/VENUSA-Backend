
const Categorys = require("../models/categories");
const fs = require("fs");
const path = require("path");
const { SubCategory, Category } = Categorys;

exports.createSubCategory = async (req, res) => {
    try {
        let { name, category, collection } = req.body;

        if (!name || !category) {
            return res.status(400).json({ success: false, message: "SubCategory name and category are required" });
        }

        name = name.trim().toLowerCase(); // Normalize name to avoid case-sensitive duplicates

        // Check if the category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check for existing subcategory with the same name under the same category
        const existingSubCategory = await SubCategory.findOne({ name, category });
        if (existingSubCategory) {
            return res.status(400).json({ success: false, message: "SubCategory already exists in this category" });
        }

        // Handle image upload and store correct path
        let image = null;
        if (req.file) {
            const sanitizedSubCategoryName = name.replace(/\s+/g, "-");
            const subCategoryFolder = path.join("uploads", `${sanitizedSubCategoryName}_${Date.now()}`);

            // Create folder if it doesn't exist
            if (!fs.existsSync(subCategoryFolder)) {
                fs.mkdirSync(subCategoryFolder, { recursive: true });
            }

            const newFilePath = path.join(subCategoryFolder, req.file.filename);
            await fs.promises.rename(req.file.path, newFilePath); // Move file safely

            const baseUrl = `${req.protocol}://${req.get("host")}`;
            image = `${baseUrl}/${newFilePath.replace(/\\/g, "/")}`; // Store full URL
        }

        // Create subcategory
        const subCategory = new SubCategory({ name, category, image, collection });
        await subCategory.save();

        // Add subcategory reference to Category
        await Category.findByIdAndUpdate(category, { $push: { subcategories: subCategory._id } });

        res.status(201).json({ success: true, message: "SubCategory created successfully", subCategory });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find();
        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subcategories", error: error.message });
    }
};

exports.getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ category: categoryId });

        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subcategories", error: error.message });
    }
};


exports.updateSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        let updates = { ...req.body };

        // Check if subcategory exists
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        // Handle image update
        if (req.file) {
            const sanitizedSubCategoryName = subCategory.name.replace(/\s+/g, "-");
            const subCategoryFolder = path.join("uploads", `${sanitizedSubCategoryName}_${subCategory._id}`);

            // Create folder if it doesn't exist
            if (!fs.existsSync(subCategoryFolder)) {
                fs.mkdirSync(subCategoryFolder, { recursive: true });
            }

            const newFilePath = path.join(subCategoryFolder, req.file.filename);
            await fs.promises.rename(req.file.path, newFilePath); // Move file safely

            const baseUrl = `${req.protocol}://${req.get("host")}`;
            updates.image = `${baseUrl}/${newFilePath.replace(/\\/g, "/")}`; // Store full URL

            // Delete old image if it exists
            if (subCategory.image) {
                const oldImagePath = path.join(__dirname, "..", subCategory.image);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        await fs.promises.unlink(oldImagePath);
                    } catch (err) {
                        console.error("Error deleting old image:", err);
                    }
                }
            }
        }

        // Update subcategory
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(subCategoryId, updates, { new: true });

        res.status(200).json({ success: true, message: "SubCategory updated successfully", updatedSubCategory });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.deleteSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        const deletedSubCategory = await SubCategory.findByIdAndDelete(subCategoryId);
        if (!deletedSubCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        res.status(200).json({ success: true, message: "SubCategory deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting subcategory", error: error.message });
    }
};