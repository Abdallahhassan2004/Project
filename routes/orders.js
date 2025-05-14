const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders (admin) or user orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = req.user.role === 'admin'
            ? await Order.find().populate('user', 'name email').populate('products.product', 'name price')
            : await Order.find({ user: req.user.id }).populate('products.product', 'name price');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', [protect, [
    check('products', 'Products are required').isArray(),
    check('products.*.product', 'Product ID is required').not().isEmpty(),
    check('products.*.quantity', 'Quantity must be a number').isNumeric(),
    check('totalAmount', 'Total amount is required').isNumeric(),
    check('shippingAddress', 'Shipping address is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newOrder = new Order({
            user: req.user.id,
            ...req.body
        });

        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', [protect, admin], async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = req.body.status;
        order.lastEdited = Date.now();
        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is admin or if the order belongs to the user
        if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.remove();
        res.json({ message: 'Order removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; 