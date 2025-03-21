const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/loginUser", loginController.loginUser);
router.post("/createUser",authMiddleware, loginController.createUser);
router.post("/validateOTPforUsers", loginController.validateOTPforUsers);
router.post("/loginCustomer", loginController.loginCustomer);
router.post("/validateOTPforCustomers", loginController.validateOTPforCustomers);
router.post("/reGenrateOTP", loginController.reGenrateOTP);

module.exports = router;