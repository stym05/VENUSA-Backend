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

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        // Handle image - multer-s3 has already uploaded the file
        let image = null;
        if (req.file) {
            // The file is already uploaded by multer-s3
            // req.file.location contains the full URL to the uploaded file
            image = req.file.location;
            
            console.log('File uploaded successfully:', {
                originalName: req.file.originalname,
                key: req.file.key,
                location: req.file.location,
                size: req.file.size
            });
        }

        const category = new Category({ name, image });
        await category.save();

        res.status(201).json({ 
            success: true, 
            message: "Category created successfully", 
            category 
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
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

        // Handle image update - multer-s3 has already uploaded the new file
        if (req.file) {
            // Delete old image if it exists
            if (category.image) {
                try {
                    // Extract the key from the old image URL
                    const oldImageKey = extractKeyFromUrl(category.image);
                    if (oldImageKey) {
                        const deleteParams = {
                            Bucket: process.env.DO_SPACE_NAME || 'venusa-bucket',
                            Key: oldImageKey,
                        };
                        await s3.send(new DeleteObjectCommand(deleteParams));
                        console.log(`Old image deleted: ${oldImageKey}`);
                    }
                } catch (err) {
                    console.error("Error deleting old image:", err.message);
                    // Continue with update even if old image deletion fails
                }
            }

            // Set new image URL from multer-s3 upload
            updates.image = req.file.location;
            
            console.log('New image uploaded:', {
                originalName: req.file.originalname,
                key: req.file.key,
                location: req.file.location,
                size: req.file.size
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

        res.status(200).json({ 
            success: true, 
            message: "Category updated successfully", 
            category: updatedCategory 
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        // Find the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Delete the image from DigitalOcean Space (if exists)
        if (category.image) {
            try {
                const imageKey = extractKeyFromUrl(category.image);
                if (imageKey) {
                    const deleteParams = {
                        Bucket: process.env.DO_SPACE_NAME || 'venusa-bucket',
                        Key: imageKey,
                    };
                    await s3.send(new DeleteObjectCommand(deleteParams));
                    console.log(`Image deleted from Space: ${imageKey}`);
                }
            } catch (err) {
                console.error("Error deleting image from Space:", err.message);
                // Continue with category deletion even if image deletion fails
            }
        }

        // Delete the category document
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ 
            success: true, 
            message: "Category deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting category", 
            error: error.message 
        });
    }
};

// Helper function to extract the key from DigitalOcean Spaces URL
function extractKeyFromUrl(imageUrl) {
    if (!imageUrl) return null;
    
    try {
        // Handle different URL formats:
        // https://venusa-bucket.blr1.digitaloceanspaces.com/images/filename.jpg
        // https://venusa-bucket.blr1.digitaloceanspaces.com/images/category-name-123456.jpg
        
        const url = new URL(imageUrl);
        const pathname = url.pathname;
        
        // Remove leading slash and return the key
        return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (error) {
        console.error('Error extracting key from URL:', error);
        
        // Fallback: try to extract from URL string
        const parts = imageUrl.split('/');
        if (parts.length >= 2) {
            // Get the last two parts (folder/filename)
            return parts.slice(-2).join('/');
        }
        
        return null;
    }
}
