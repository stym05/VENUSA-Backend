
const Categorys = require("../models/categories");

const { SubCategory, Category } = Categorys;

// ✅ Create a new SubCategory
exports.createSubCategory = async (req, res) => {
    try {
        const { name, category } = req.body;

        const existingSubCategory = await SubCategory.findOne({ name, category });
        if (existingSubCategory) {
            return res.status(400).json({ success: false, message: "SubCategory already exists in this category" });
        }

        const subCategory = new SubCategory({ name, category });
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
        const subCategories = await SubCategory.find().populate("category");
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
        const updates = req.body;

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(subCategoryId, updates, { new: true });

        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        res.status(200).json({ success: true, message: "SubCategory updated successfully", updatedSubCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating subcategory", error: error.message });
    }
};

// ✅ Delete SubCategory
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