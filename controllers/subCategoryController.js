
const Categorys = require("../models/categories");
const fs = require("fs");
const path = require("path");
const s3 = require("../config/digitalOceanStorage");
const { SubCategory, Category } = Categorys;

const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.createSubCategory = async (req, res) => {
    try {
        let { name, category, collection } = req.body;

        if (!name || !category) {
            return res.status(400).json({ success: false, message: "SubCategory name and category are required" });
        }

        name = name.trim().toLowerCase();

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

        let image = null;
        if (req.file) {
            try {
                const fileName = `subcategory-${Date.now()}-${req.file.originalname}`;
                const key = `images/${fileName}`;

                const params = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: key,
                    Body: req.file.buffer,
                    ACL: "public-read",
                    ContentType: req.file.mimetype,
                };

                const command = new PutObjectCommand(params);
                await s3.send(command);

                // Manually construct the public URL
                image = `https://venusa-bucket.blr1.digitaloceanspaces.com/${key}`;
            } catch (err) {
                console.error("Error uploading image to Space:", err.message);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        const subCategory = new SubCategory({ name, category, image, collection });
        await subCategory.save();

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

        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        // Handle image update
        if (req.file) {
            try {
                // Delete old image from Space if it exists
                if (subCategory.image) {
                    const fileName = subCategory.image.split("/").pop();
                    const deleteParams = {
                        Bucket: process.env.DO_SPACE_NAME,
                        Key: `images/${fileName}`,
                    };

                    const deleteCommand = new DeleteObjectCommand(deleteParams);
                    await s3.send(deleteCommand);
                }

                // Upload new image to Space
                const fileName = `subcategory-${Date.now()}-${req.file.originalname}`;
                const key = `images/${fileName}`;

                const uploadParams = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: key,
                    Body: req.file.buffer,
                    ACL: "public-read",
                    ContentType: req.file.mimetype,
                };

                const uploadCommand = new PutObjectCommand(uploadParams);
                await s3.send(uploadCommand);

                updates.image = `https://venusa-bucket.blr1.digitaloceanspaces.com/${key}`;
            } catch (err) {
                console.error("Error uploading image to Space:", err.message);
                return res.status(500).json({ success: false, message: "Image update failed" });
            }
        }

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

        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }

        // Delete image from Space if it exists
        if (subCategory.image) {
            try {
                const fileName = subCategory.image.split("/").pop();
                const deleteParams = {
                    Bucket: process.env.DO_SPACE_NAME,
                    Key: `images/${fileName}`,
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                await s3.send(deleteCommand);
                console.log("Image deleted from Space:", fileName);
            } catch (err) {
                console.error("Error deleting image from Space:", err.message);
            }
        }

        // Delete the subcategory from the database
        await subCategory.deleteOne();

        res.status(200).json({ success: true, message: "SubCategory deleted successfully" });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};