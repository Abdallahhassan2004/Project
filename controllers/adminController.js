const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getAdminPage = async (req, res) => {
    try {
        // Fetch latest products
        const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
        const totalProducts = latestProducts.length;
        const totalUsers = await User.countDocuments();
        const regularUsers = await User.countDocuments({ role: 'user' });
        const categories = await Product.distinct('category');
        const latestOrders = await Order.find()
            .populate('user', 'username email')
            .populate('products.product', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
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

// Get orders page
exports.getOrdersPage = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .populate('products.product', 'name')
            .sort({ createdAt: -1 });
        console.log('Orders fetched for admin:', orders);

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