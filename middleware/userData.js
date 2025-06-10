const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to make user data available to all EJS templates
const userData = async (req, res, next) => {
    try {
        // Add cache control headers to prevent back button access
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        // Check for JWT token in cookies
        const token = req.cookies.token;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select('-password');
                
                if (user) {
                    // Make user data available to all templates
                    res.locals.user = {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    };
                }
            } catch (error) {
                // Invalid token, clear cookie
                res.clearCookie('token');
                console.log('Invalid token, cleared cookie');
            }
        }
        
        // Always set user to null if not authenticated (for template logic)
        if (!res.locals.user) {
            res.locals.user = null;
        }
        
        next();
    } catch (error) {
        console.error('User data middleware error:', error);
        res.locals.user = null;
        next();
    }
};

module.exports = userData; 