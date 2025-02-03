const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:productId", productController.getProductById);
router.put("/:productId", productController.updateProduct);
router.delete("/:productId", productController.deleteProduct);
router.get("/subcategory/:subcategoryId", productController.getProductsBySubCategory);
router.put("/:productId/stock", productController.updateStock);

module.exports = router;
