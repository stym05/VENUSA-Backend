const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");


router.post("/loginUser", loginController.loginUser);
router.post("/createUser", loginController.createUser);
router.post("/validateOTPforUsers", loginController.validateOTPforUsers);

module.exports = router;