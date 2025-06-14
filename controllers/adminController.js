const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const parsePrice = require('../utils/priceParser');

// Admin Dashboard
exports.getAdminPage = async (req, res) => {
    try {
        const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
        const totalProducts = latestProducts.length;
        const totalUsers = await User.countDocuments();
        const regularUsers = await User.countDocuments({ role: 'user' });
        const categories = await Product.distinct('category');
        const latestOrders = await Order.find().populate('user', 'username email').populate('products.product', 'name').sort({ createdAt: -1 }).limit(5);
        const latestUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
        res.render('admin', {
            title: 'Admin Panel',
            totalProducts,
            totalUsers,
            regularUsers,
            categories,
            products: latestProducts,
            orders: latestOrders,
            users: latestUsers
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).render('error', {
            message: 'An error occurred while fetching admin dashboard data'
        });
    }
};

// Get users page
exports.getUsersPage = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('admin/users', {
            title: 'User Management',
            users: users,
            active: 'users'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).render('error', {
            message: 'An error occurred while fetching users'
        });
    }
};

// Add user
exports.addUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username: username.trim(), email: email.toLowerCase().trim(), password: hashedPassword, role: role });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt } });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }
        await User.findByIdAndDelete(userId);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get orders page
exports.getOrdersPage = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'username email').populate('products.product', 'name').sort({ createdAt: -1 });
        res.render('admin/orders', {
            title: 'Order Management',
            orders: orders,
            active: 'orders'
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).render('error', {
            message: 'An error occurred while fetching orders'
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' });
        }
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.json({ success: true, message: 'Status updated successfully', order: { id: order._id, status: order.status } });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
    }
};

// Get products page
exports.getProductsPage = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', {
            title: 'Product Management',
            products: products,
            active: 'products'
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).render('error', {
            message: 'An error occurred while fetching products'
        });
    }
};

// Add Product Page
exports.getAddProductPage = (req, res) => {
    res.render('admin/add-product');
};

// Handle Add Product Form Submission
exports.addProduct = async (req, res) => {
    try {
        const { name, category, price, description, mainImage, thumbnails, alt } = req.body;
        if (!name || !category || !price || !description || !mainImage || !thumbnails || !alt) {
            return res.status(400).send('All fields are required');
        }
        const thumbnailArray = thumbnails.split('\n').map(thumbnail => thumbnail.trim()).filter(thumbnail => thumbnail.length > 0);
        if (thumbnailArray.length === 0) {
            return res.status(400).send('At least one thumbnail image is required');
        }
        const priceNum = parseFloat(price);
        const product = new Product({
            name: name.trim(),
            category: category,
            price: `EGP ${priceNum.toFixed(0)}`,
            description: description.trim(),
            images: {
                main: mainImage.trim(),
                thumbnails: thumbnailArray
            },
            alt: alt.trim()
        });
        const savedProduct = await product.save();
        res.status(201).json({ success: true, message: 'Product added successfully', product: savedProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Internal server error while adding product');
    }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.status = status;
        await product.save();
        res.json({ message: 'Status updated successfully', product });
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

// Test admin route for debugging
exports.getAdminTestPage = (req, res) => {
    res.json({ success: true, message: 'Admin authentication working', user: req.user });
};

// Test admin authentication API
exports.testAdminAuth = (req, res) => {
    res.json({ message: 'Admin authentication working', user: req.user });
};

// Test product routes API
exports.testAdminProducts = async (req, res) => {
    try {
        const products = await Product.find().limit(1);
        res.json({
            message: 'Product routes working',
            productCount: products.length,
            sampleProduct: products[0] ? { id: products[0]._id, name: products[0].name } : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error testing products', error: error.message });
    }
};

// Get single product for editing
exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const { name, category, price, description, alt, featured } = req.body;
        
        // Update basic fields
        if (name) product.name = name.trim();
        if (category) product.category = category;
        if (price) product.price = price;
        if (description) product.description = description.trim();
        if (alt !== undefined) product.alt = alt.trim();
        if (featured !== undefined) product.featured = featured === 'true' || featured === true;
        
        // Handle file uploads if provided
        if (req.files && req.files.mainImage) {
            product.images.main = req.files.mainImage.name;
            // Move uploaded file to Images directory
            await req.files.mainImage.mv(`./public/Images/${req.files.mainImage.name}`);
        }
        
        if (req.files && req.files.thumbnails) {
            const thumbnails = Array.isArray(req.files.thumbnails) ? req.files.thumbnails : [req.files.thumbnails];
            product.images.thumbnails = thumbnails.map(file => file.name);
            
            // Move uploaded files to Images directory
            for (const file of thumbnails) {
                await file.mv(`./public/Images/${file.name}`);
            }
        }
        
        await product.save();
        res.json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 