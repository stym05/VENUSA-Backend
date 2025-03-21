const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

// Add product to cart
router.post('/add', authMiddleware, cartController.addToCart);

// Get user cart
router.get('/:userId', authMiddleware, cartController.getCart);

// Remove product from cart
router.delete('/remove', authMiddleware, cartController.removeFromCart);

module.exports = router;
