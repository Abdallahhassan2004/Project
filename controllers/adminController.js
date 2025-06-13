const User = require('../models/User');
const Order = require('../models/Order');

exports.getAdminPage = (req, res) => {
    res.render('admin', {
      title: 'Admin Panel',
      todaysOrders: 128,
      totalOrders: 15265,
      pendingOrders: 327,
      cancelledOrders: 1360,
      siteViews: 45678,
      products: [
        { id: 1, name: 'Traditional Dining Set', category: 'Dining', price: '£1,499', dateAdded: '2025-05-01', lastEdited: '2025-05-10' },
        { id: 2, name: 'Modern Sofa', category: 'Living Room', price: '£899', dateAdded: '2025-04-15', lastEdited: '2025-05-05' }
      ],
      orders: [
        { id: 101, user: 'John Doe', product: 'Modern Dining Set', status: 'Pending', datePlaced: '2025-05-10', lastEdited: '2025-05-11' },
        { id: 102, user: 'Jane Smith', product: 'Traditional Sofa', status: 'Shipped', datePlaced: '2025-05-09', lastEdited: '2025-05-10' }
      ],
      users: [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', dateRegistered: '2025-04-15', lastEdited: '2025-05-12' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', dateRegistered: '2025-04-20', lastEdited: '2025-05-10' }
      ]
    });
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