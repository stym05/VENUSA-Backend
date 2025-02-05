const Wishlist = require('../models/wishlist');

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [{ product: productId }] });
        } else {
            const existingProduct = wishlist.products.find(item => item.product.toString() === productId);
            if (existingProduct) {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }
            wishlist.products.push({ product: productId });
        }

        await wishlist.save();
        res.status(200).json({ message: 'Product added to wishlist', wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user wishlist
exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
        
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        res.status(200).json({ wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(item => item.product.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};