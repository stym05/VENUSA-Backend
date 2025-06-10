const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subCategoryController");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/" ,upload.single('image'), subCategoryController.createSubCategory);
router.get("/", subCategoryController.getAllSubCategories);
router.get("/:categoryId", subCategoryController.getSubCategoriesByCategory);
router.put("/:subCategoryId", authMiddleware, upload.single('image'), subCategoryController.updateSubCategory);
router.delete("/:subCategoryId", authMiddleware , subCategoryController.deleteSubCategory);

module.exports = router;
