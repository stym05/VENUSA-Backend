const Categorys = require("../models/categories");

const { Category } = Categorys;

// ✅ Create a new Category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ success: true, message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating category", error: error.message });
    }
};

// ✅ Get all Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate("subcategories");
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

// ✅ Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const updates = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated successfully", updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating category", error: error.message });
    }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
    }
};

