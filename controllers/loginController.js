const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get login page
exports.getLoginPage = (req, res) => {
    res.render('login', { 
        title: 'Login',
        error: req.query.error,
        success: req.query.success
    });
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.render('login', {
                title: 'Login',
                error: 'Please provide email and password',
                email
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid credentials',
                email
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid credentials',
                email
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Redirect based on role
        if (user.role === 'admin') {
            return res.redirect('/admin');
        }

        // Default redirect for regular users
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            error: 'An error occurred. Please try again.',
            email: req.body.email
        });
    }
};

// Logout user
exports.logout = (req, res) => {
    // Clear cookie
    res.clearCookie('token');
    
    // Set cache control headers to prevent back button access
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    // Redirect to home page
    res.redirect('/');
};