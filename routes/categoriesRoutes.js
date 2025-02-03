const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoriesController");

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.put("/:categoryId", categoryController.updateCategory);
router.delete("/:categoryId", categoryController.deleteCategory);

module.exports = router;
