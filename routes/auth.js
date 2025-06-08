const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Admin registration route
router.post('/admin/register', authController.registerAdmin);

// Authentication routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);
router.get('/forgot-password', authController.getForgotPasswordPage);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.getResetPasswordPage);
router.post('/reset-password/:token', authController.resetPassword);

// Protected route example
router.get('/profile', auth, authController.getProfile);

module.exports = router; 