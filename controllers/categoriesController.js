const Categorys = require("../models/categories");
const fs = require("fs");
const path = require("path");

const { Category } = Categorys;


exports.createCategory = async (req, res) => {
    try {
        let { name } = req.body;

        // Validate category name
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        name = name.trim().toLowerCase(); // Normalize name for consistency

        // Construct full image URL
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const image = req.file ? `${baseUrl}/${req.file.path.replace(/\\/g, "/")}` : null;

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

// ✅ Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        let updates = { ...req.body };

        // Validate categoryId format
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Normalize name and check if it's already taken
        if (updates.name) {
            updates.name = updates.name.trim().toLowerCase();
            const existingCategory = await Category.findOne({ name: updates.name });
            if (existingCategory && existingCategory._id.toString() !== categoryId) {
                return res.status(400).json({ success: false, message: "Category name already exists" });
            }
        }

        // Handle image upload
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            updates.categoryImage = `${baseUrl}/${req.file.path.replace(/\\/g, "/")}`; // Store full URL

            // Delete old image only if a new one is uploaded
            if (category.categoryImage) {
                const oldImagePath = path.join(__dirname, "..", category.categoryImage.replace(baseUrl + "/", ""));
                try {
                    if (fs.existsSync(oldImagePath)) {
                        await fs.promises.unlink(oldImagePath);
                    }
                } catch (unlinkError) {
                    console.error("Error deleting old image:", unlinkError);
                }
            }
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

        res.status(200).json({ success: true, message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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

