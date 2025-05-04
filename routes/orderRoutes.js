const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/createPreOrder", authMiddleware ,orderController.CreatePreOrder);


module.exports = router;