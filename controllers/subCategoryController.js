
const Categorys = require("../models/categories");
const fs = require("fs");
const path = require("path");
const { SubCategory, Category } = Categorys;

// ✅ Create a new SubCategory
exports.createSubCategory = async (req, res) => {
    try {
        const { name, category, collection } = req.body;
        const image = req.file ? req.file.path.replace(/\\/g, "/"): null;

        const existingSubCategory = await SubCategory.findOne({ name, category });
        if (existingSubCategory) {
            return res.status(400).json({ success: false, message: "SubCategory already exists in this category" });
        }

        const subCategory = new SubCategory({ name, category, image, collection });
        await subCategory.save();

        await Category.findByIdAndUpdate(category, { $push: { subcategories: subCategory._id } });

        res.status(201).json({ success: true, message: "SubCategory created successfully", subCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating subcategory", error: error.message });
    }
};

// ✅ Get all SubCategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find();
        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subcategories", error: error.message });
    }
};

// ✅ Get SubCategories by Category
exports.getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ category: categoryId });

        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subcategories", error: error.message });
    }
};

// ✅ Update SubCategory
exports.updateSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        let updates = { ...req.body };

        // Handle image upload
        if (req.file) {
            updates.image = req.file.path.replace(/\\/g, "/"); // Normalize path

            // Optional: Delete the old image if it exists
            const subCategory = await SubCategory.findById(subCategoryId);
            if (subCategory?.image) {
                const oldImagePath = path.join(__dirname, "..", subCategory.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(subCategoryId, updates, { new: true });

        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        res.status(200).json({ success: true, message: "SubCategory updated successfully", updatedSubCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating subcategory", error: error.message });
    }
};

// ✅ Delete SubCategoryhttp://localhost:8000/api/subcategories
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