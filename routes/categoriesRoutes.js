const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoriesController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/",authMiddleware, upload.single("image"), categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.put("/:categoryId", authMiddleware, upload.single("image"), categoryController.updateCategory);
router.delete("/:categoryId", authMiddleware, categoryController.deleteCategory);

module.exports = router;
