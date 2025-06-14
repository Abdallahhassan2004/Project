const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Admin Dashboard
router.get('/', adminAuth, adminController.getAdminPage);

// User Management
router.get('/users', adminAuth, adminController.getUsersPage);
router.post('/add-user', adminAuth, adminController.addUser);
router.delete('/delete-user/:userId', adminAuth, adminController.deleteUser);

// Order Management
router.get('/orders', adminAuth, adminController.getOrdersPage);
router.patch('/api/orders/:id/status', adminAuth, adminController.updateOrderStatus);

// Product Management
router.get('/products', adminAuth, adminController.getProductsPage);
router.get('/add-product', adminAuth, adminController.getAddProductPage);
router.post('/add-product', adminAuth, adminController.addProduct);
router.patch('/api/products/:id/status', adminAuth, adminController.updateProductStatus);

// New product routes for edit/delete functionality
router.get('/api/products/:id', adminAuth, adminController.getProduct);
router.put('/api/products/:id', adminAuth, adminController.updateProduct);
router.delete('/api/products/:id', adminAuth, adminController.deleteProduct);

// Test Routes (for debugging)
router.get('/test', adminAuth, adminController.getAdminTestPage);
router.get('/api/test-auth', adminAuth, adminController.testAdminAuth);
router.get('/api/test-products', adminAuth, adminController.testAdminProducts);

module.exports = router; 