const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// demo url for testing
http://localhost:5000/api/customer/register

// Define Routes
router.post("/register", customerController.registerCustomer);
router.post("/verify-otp", customerController.verifyOTP);
router.get("/:id", customerController.getCustomerById);
router.put("/update", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.get("/",customerController.getCustomer)

module.exports = router;
