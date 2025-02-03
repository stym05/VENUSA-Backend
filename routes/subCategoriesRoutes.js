const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subCategoryController");

router.post("/", subCategoryController.createSubCategory);
router.get("/", subCategoryController.getAllSubCategories);
router.get("/:categoryId", subCategoryController.getSubCategoriesByCategory);
router.put("/:subCategoryId", subCategoryController.updateSubCategory);
router.delete("/:subCategoryId", subCategoryController.deleteSubCategory);

module.exports = router;
