const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishListController');

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Get user wishlist
router.get('/:userId', wishlistController.getWishlist);

// Remove product from wishlist
router.delete('/remove', wishlistController.removeFromWishlist);

module.exports = router;