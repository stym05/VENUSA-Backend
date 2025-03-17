const express = require("express");
const router = express.Router();

const SubscriberController = require("../controllers/subscriberController");

router.post("/create", SubscriberController.createSubscriber);
router.get("/fetch", SubscriberController.getSubscribers);

module.exports = router;