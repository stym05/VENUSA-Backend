const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add product to cart
router.post('/add', cartController.addToCart);

// Get user cart
router.get('/:userId', cartController.getCart);

// Remove product from cart
router.delete('/remove', cartController.removeFromCart);

module.exports = router;
