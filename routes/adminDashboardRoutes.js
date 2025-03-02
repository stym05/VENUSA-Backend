const express = require('express');
const router = express.Router();

const adminDashboardContoller = require("../controllers/adminDashboardController");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/getAllTablesData",authMiddleware, adminDashboardContoller.getAllTables);
router.post("/getTableDetails", authMiddleware, adminDashboardContoller.getTableDetails);


module.exports = router;