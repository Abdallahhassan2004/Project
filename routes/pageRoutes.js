const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// General page routes
router.get('/', pageController.getHomePage);
router.get('/login', pageController.getLoginPage);
router.get('/signup', pageController.getSignupPage);

// Category routes
router.get('/dining', pageController.getDiningPage);
router.get('/bedroom', pageController.getBedroomPage);
router.get('/living', pageController.getLivingPage);
router.get('/kitchen', pageController.getKitchenPage);

module.exports = router; 