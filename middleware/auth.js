const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple authentication check middleware (for redirecting to login)
const requireAuth = async (req, res, next) => {
    console.log('requireAuth middleware: Checking authentication for', req.originalUrl);
    try {
        const token = req.cookies.token;
        console.log('requireAuth: Token found:', !!token);
        
        if (!token) {
            console.log('requireAuth: No token, redirecting to login');
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('requireAuth: Token decoded successfully', decoded.userId);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.clearCookie('token');
            console.log('requireAuth: User not found in DB, clearing token and redirecting');
            return res.redirect('/auth/login');
        }

        req.user = {
            userId: user._id,
            role: user.role
        };
        console.log('requireAuth: User authenticated, proceeding.');
        next();
    } catch (error) {
        // Log detailed error information
        console.error('requireAuth: JWT Verification Error for', req.originalUrl, ':', error.name, '-', error.message);
        res.clearCookie('token');
        console.log('requireAuth: Cleared cookie due to JWT verification error.');
        res.redirect('/auth/login');
    }
};

// Regular user authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            userId: user._id,
            role: user.role
        };
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate', error: error.message });
    }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    console.log('=== ADMIN AUTH MIDDLEWARE ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    console.log('Cookies:', req.cookies);
    
    try {
        const token = req.cookies.token;
        console.log('Token found:', !!token);
        
        if (!token) {
            console.log('No token found');
            // Check if it's an API request or web request
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ message: 'Authentication required' });
            } else {
                return res.redirect('/auth/login');
            }
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);
        const user = await User.findById(decoded.userId);
        console.log('User found:', !!user);
        console.log('User role:', user?.role);

        if (!user) {
            console.log('User not found in database');
            // Check if it's an API request or web request
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ message: 'User not found' });
            } else {
                res.clearCookie('token');
                return res.redirect('/auth/login');
            }
        }

        if (user.role !== 'admin') {
            console.log('User is not admin, role:', user.role);
            // Check if it's an API request or web request
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({ message: 'Admin access required' });
            } else {
                return res.redirect('/auth/login');
            }
        }

        console.log('Admin authentication successful');
        req.user = {
            userId: user._id,
            role: user.role
        };
        req.token = token;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        // Check if it's an API request or web request
        if (req.path.startsWith('/api/')) {
            res.status(401).json({ message: 'Please authenticate', error: error.message });
        } else {
            res.clearCookie('token');
            res.redirect('/auth/login');
        }
    }
};

module.exports = { auth, adminAuth, requireAuth }; 