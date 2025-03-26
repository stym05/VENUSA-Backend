const Cart = require('../models/cart');

// Add product to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, size, color } = req.body;
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, products: [{ product: productId, size, color }] });
        } else {
            const existingProduct = cart.products.find(item => item.product.toString() === productId && item.size === size);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, size, color});
            }
        }

        await cart.save();
        res.status(200).json({ success: true, code: 100, message: 'Product added to cart', cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get user cart
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        
        if (!cart) {
            return res.status(200).json({ success: true, code: 200,  message: 'Cart not found' });
        }

        res.status(200).json({ success: true, code: 100, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId, size } = req.body;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ success: true, code: 200, message: 'Cart not found' });
        }

        cart.products = cart.products.filter(item => !(item.product.toString() === productId && item.size === size));
        await cart.save();

        res.status(200).json({ success: true, code : 100, message: 'Product removed from cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};