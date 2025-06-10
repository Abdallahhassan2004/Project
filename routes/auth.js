const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginController = require('../controllers/loginController');
const { auth } = require('../middleware/auth');

// Admin registration routes
router.get('/admin/register', (req, res) => {
    res.render('admin-register', {
        title: 'Admin Registration',
        error: req.query.error
    });
});
router.post('/admin/register', authController.registerAdmin);

// Authentication routes - using loginController for login/logout
router.get('/login', loginController.getLoginPage);
router.post('/login', loginController.login);
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

// Signup routes - using authController
router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.signup);

// Password reset routes - using authController
router.get('/forgot-password', authController.getForgotPasswordPage);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.getResetPasswordPage);
router.post('/reset-password/:token', authController.resetPassword);

// Protected route example
router.get('/profile', auth, authController.getProfile);

module.exports = router; 