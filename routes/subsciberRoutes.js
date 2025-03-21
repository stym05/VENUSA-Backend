const express = require("express");
const router = express.Router();

const SubscriberController = require("../controllers/subscriberController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", SubscriberController.createSubscriber);
router.get("/fetch", authMiddleware, SubscriberController.getSubscribers);

module.exports = router;