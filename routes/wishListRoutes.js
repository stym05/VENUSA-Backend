const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishListController');
const authMiddleware = require('../middlewares/authMiddleware');

// Add product to wishlist
router.post('/add', authMiddleware, wishlistController.addToWishlist);

// Get user wishlist
router.get('/:userId', authMiddleware, wishlistController.getWishlist);

// Remove product from wishlist
router.delete('/remove', authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;