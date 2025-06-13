const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Public routes
// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin routes (these will be protected by adminAuth middleware)
// Add a new product
router.post('/', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        images: req.body.images,
        alt: req.body.alt
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a product
router.patch('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        console.log('=== DELETE PRODUCT ROUTE (productRoutes) ===');
        console.log('Product ID:', req.params.id);
        console.log('User:', req.user);
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Product found:', product.name);

        // Remove product from all users' carts first
        const User = require('../models/User');
        console.log('Removing product from all carts...');
        const cartCleanupResult = await User.removeProductFromAllCarts(req.params.id);
        console.log('Cart cleanup result:', cartCleanupResult);
        
        // Delete the product
        console.log('Deleting product from database...');
        await Product.findByIdAndDelete(req.params.id);
        console.log('Product deleted successfully');
        
        console.log(`Product ${req.params.id} deleted successfully and removed from all carts`);
        
        // Notify connected clients about the cart cleanup
        if (global.notifyCartClients) {
            global.notifyCartClients({
                type: 'product_removed',
                productId: req.params.id,
                productName: product.name,
                message: `Product "${product.name}" has been removed and is no longer available.`,
                usersAffected: cartCleanupResult.modifiedCount
            });
        }
        
        res.json({ 
            message: 'Product deleted successfully',
            removedFromCarts: true,
            usersAffected: cartCleanupResult.modifiedCount
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            message: 'Error deleting product',
            error: error.message 
        });
    }
});

module.exports = router; 