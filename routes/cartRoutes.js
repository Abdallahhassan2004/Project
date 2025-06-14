const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth, requireAuth } = require('../middleware/auth');

// Get cart page (requires authentication)
router.get('/', requireAuth, cartController.getCartPage);

// Get cart count (accessible without full auth for header display)
router.get('/count', cartController.getCartCount);

// Add product to cart (requires authentication)
router.post('/add/:id', auth, cartController.addProductToCart);

// Remove product from cart (requires authentication)
router.post('/remove/:id', auth, cartController.removeProductFromCart);

// Update cart item quantity (requires authentication)
router.post('/update/:id', auth, cartController.updateCartItemQuantity);

// Server-Sent Events for real-time cart notifications
router.get('/events', cartController.getCartEvents);

module.exports = router; 