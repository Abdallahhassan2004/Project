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
    try {
        // Format price with EGP
        const priceNum = parseFloat(req.body.price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ message: 'Invalid price' });
        }
        
        const product = new Product({
            name: req.body.name,
            category: req.body.category,
            price: `EGP ${priceNum.toFixed(0)}`,
            description: req.body.description,
            images: req.body.images,
            alt: req.body.alt
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a product
router.patch('/:id', async (req, res) => {
    try {
        console.log('=== UPDATE PRODUCT ROUTE ===');
        console.log('Product ID:', req.params.id);
        console.log('User:', req.user);
        console.log('Request body:', req.body);
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Product found:', product.name);

        // Extract and validate form data
        const { name, category, price, description, mainImage, thumbnails, alt } = req.body;

        // Strict validation
        const validationErrors = [];

        // Name validation
        if (!name || !name.trim()) {
            validationErrors.push('Product name is required');
        } else if (name.trim().length < 3) {
            validationErrors.push('Product name must be at least 3 characters');
        } else if (name.trim().length > 100) {
            validationErrors.push('Product name cannot exceed 100 characters');
        } else if (!/^[a-zA-Z0-9\s\-_.,&()]+$/.test(name.trim())) {
            validationErrors.push('Product name contains invalid characters');
        }

        // Category validation
        const validCategories = ['Living Room', 'Bedroom', 'Kitchen', 'Dining'];
        if (!category || !validCategories.includes(category)) {
            validationErrors.push('Please select a valid category');
        }

        // Price validation
        const priceNum = parseFloat(price);
        if (!price || isNaN(priceNum) || priceNum < 0) {
            validationErrors.push('Please enter a valid positive price');
        } else if (priceNum > 999999.99) {
            validationErrors.push('Price cannot exceed 999,999.99');
        }

        // Description validation
        if (!description || !description.trim()) {
            validationErrors.push('Description is required');
        } else if (description.trim().length < 10) {
            validationErrors.push('Description must be at least 10 characters');
        } else if (description.trim().length > 1000) {
            validationErrors.push('Description cannot exceed 1000 characters');
        }

        // Main image validation
        if (!mainImage || !mainImage.trim()) {
            validationErrors.push('Main image path is required');
        } else if (!/^[a-zA-Z0-9\/\-_.]+$/.test(mainImage.trim())) {
            validationErrors.push('Invalid main image path format');
        }

        // Thumbnails validation
        if (!thumbnails || !thumbnails.trim()) {
            validationErrors.push('At least one thumbnail image is required');
        } else {
            const thumbnailArray = thumbnails.split('\n').filter(url => url.trim());
            if (thumbnailArray.length === 0) {
                validationErrors.push('At least one thumbnail image is required');
            } else if (thumbnailArray.length > 10) {
                validationErrors.push('Maximum 10 thumbnail images allowed');
            } else {
                const invalidPaths = thumbnailArray.filter(url => !/^[a-zA-Z0-9\/\-_.]+$/.test(url.trim()));
                if (invalidPaths.length > 0) {
                    validationErrors.push('Some thumbnail paths have invalid format');
                }
            }
        }

        // Alt text validation
        if (!alt || !alt.trim()) {
            validationErrors.push('Alt text is required');
        } else if (alt.trim().length < 3) {
            validationErrors.push('Alt text must be at least 3 characters');
        } else if (alt.trim().length > 200) {
            validationErrors.push('Alt text cannot exceed 200 characters');
        }

        // Category-specific image path validation
        const categoryPaths = {
            'Living Room': 'livingRooms/',
            'Bedroom': 'bedrooms/',
            'Kitchen': 'kitchen/',
            'Dining': 'dining/'
        };

        const expectedPath = categoryPaths[category];
        if (mainImage && !mainImage.startsWith(expectedPath)) {
            validationErrors.push(`Main image path should start with "${expectedPath}" for ${category} products`);
        }

        const thumbnailArray = thumbnails ? thumbnails.split('\n').filter(url => url.trim()) : [];
        const invalidThumbnails = thumbnailArray.filter(url => !url.startsWith(expectedPath));
        if (invalidThumbnails.length > 0) {
            validationErrors.push(`All thumbnail paths should start with "${expectedPath}" for ${category} products`);
        }

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            console.log('Validation errors:', validationErrors);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validationErrors 
            });
        }

        // Update product with validated data
        product.name = name.trim();
        product.category = category;
        product.price = `EGP ${priceNum.toFixed(0)}`;
        product.description = description.trim();
        product.images = {
            main: mainImage.trim(),
            thumbnails: thumbnailArray
        };
        product.alt = alt.trim();

        console.log('Updating product with data:', {
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            images: product.images,
            alt: product.alt
        });

        const updatedProduct = await product.save();
        console.log('Product updated successfully');

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            message: 'Error updating product',
            error: error.message 
        });
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