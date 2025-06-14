const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { auth, requireAuth } = require('../middleware/auth');

// Get checkout page (requires authentication)
router.get('/', requireAuth, checkoutController.getCheckoutPage);

// Process checkout (requires authentication)
router.post('/process', auth, checkoutController.processCheckout);

// Get checkout success page
router.get('/success', checkoutController.getCheckoutSuccessPage);

module.exports = router; 