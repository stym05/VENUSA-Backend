const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/",authMiddleware, upload.array("image", 6), productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:productId", productController.getProductById);
router.put("/:productId",authMiddleware, upload.array("image", 6), productController.updateProduct);
router.delete("/:productId",authMiddleware, productController.deleteProduct);
router.get("/subcategory/:subcategoryId", productController.getProductsBySubCategory);
router.put("/:productId/stock",authMiddleware, productController.updateStock);

module.exports = router;
