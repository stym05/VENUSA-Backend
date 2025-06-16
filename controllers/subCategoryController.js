const Categorys = require("../models/categories");
const mongoose = require("mongoose");
const s3 = require("../config/digitalOceanStorage");
const { SubCategory, Category } = Categorys;

const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.createSubCategory = async (req, res) => {
    try {
        let { name, category, collection } = req.body;

        if (!name || !category) {
            return res.status(400).json({ success: false, message: "SubCategory name and category are required" });
        }

        name = name.trim().toLowerCase();

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        // Check if the category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check for existing subcategory
        const existingSubCategory = await SubCategory.findOne({ name, category });
        if (existingSubCategory) {
            return res.status(400).json({ success: false, message: "SubCategory already exists in this category" });
        }

        // Handle image - multer-s3 has already uploaded the file
        let image = null;
        if (req.file) {
            // The file is already uploaded by multer-s3
            image = req.file.location;
            
            console.log('SubCategory image uploaded successfully:', {
                originalName: req.file.originalname,
                key: req.file.key,
                location: req.file.location,
                size: req.file.size
            });
        }

        const subCategory = new SubCategory({ name, category, image, collection });
        await subCategory.save();

        res.status(201).json({ 
            success: true, 
            message: "SubCategory created successfully", 
            subCategory 
        });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

exports.getAllSubCategories = async (req, res) => {
    try {   
        const subCategories = await SubCategory.find().populate('category', 'name image');
        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching subcategories", 
            error: error.message 
        });
    }
};

exports.getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        const subCategories = await SubCategory.find({ category: categoryId }).populate('category', 'name image');

        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching subcategories", 
            error: error.message 
        });
    }
};

exports.updateSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        let updates = { ...req.body };

        // Validate subcategory ID
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
        }

        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        // Validate category ID if it's being updated
        if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        // Check if category exists if it's being updated
        if (updates.category) {
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                return res.status(404).json({ success: false, message: "Category not found" });
            }
        }

        // Normalize name and check for duplicates
        if (updates.name) {
            updates.name = updates.name.trim().toLowerCase();
            const categoryToCheck = updates.category || subCategory.category;
            const existingSubCategory = await SubCategory.findOne({ 
                name: updates.name, 
                category: categoryToCheck 
            });
            if (existingSubCategory && existingSubCategory._id.toString() !== subCategoryId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "SubCategory name already exists in this category" 
                });
            }
        }

        // Handle image update - multer-s3 has already uploaded the new file
        if (req.file) {
            // Delete old image if it exists
            if (subCategory.image) {
                try {
                    const oldImageKey = extractKeyFromUrl(subCategory.image);
                    if (oldImageKey) {
                        const deleteParams = {
                            Bucket: process.env.DO_SPACE_NAME || 'venusa-bucket',
                            Key: oldImageKey,
                        };
                        await s3.send(new DeleteObjectCommand(deleteParams));
                        console.log(`Old subcategory image deleted: ${oldImageKey}`);
                    }
                } catch (err) {
                    console.error("Error deleting old image:", err.message);
                    // Continue with update even if old image deletion fails
                }
            }

            // Set new image URL from multer-s3 upload
            updates.image = req.file.location;
            
            console.log('New subcategory image uploaded:', {
                originalName: req.file.originalname,
                key: req.file.key,
                location: req.file.location,
                size: req.file.size
            });
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            subCategoryId, 
            updates, 
            { new: true }
        ).populate('category', 'name image');

        res.status(200).json({ 
            success: true, 
            message: "SubCategory updated successfully", 
            subCategory: updatedSubCategory 
        });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

exports.deleteSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        // Validate subcategory ID
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
        }

        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        // Delete image from Space if it exists
        if (subCategory.image) {
            try {
                const imageKey = extractKeyFromUrl(subCategory.image);
                if (imageKey) {
                    const deleteParams = {
                        Bucket: process.env.DO_SPACE_NAME || 'venusa-bucket',
                        Key: imageKey,
                    };
                    await s3.send(new DeleteObjectCommand(deleteParams));
                    console.log(`Subcategory image deleted from Space: ${imageKey}`);
                }
            } catch (err) {
                console.error("Error deleting image from Space:", err.message);
                // Continue with subcategory deletion even if image deletion fails
            }
        }

        // Delete the subcategory from the database
        await SubCategory.findByIdAndDelete(subCategoryId);

        res.status(200).json({ 
            success: true, 
            message: "SubCategory deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
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