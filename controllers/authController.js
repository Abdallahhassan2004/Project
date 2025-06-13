const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendPasswordResetEmail } = require('../config/email');

// Get login page
exports.getLoginPage = (req, res) => {
    res.render('login', { 
        title: 'Login',
        error: req.query.error
    });
};

// Get signup page
exports.getSignupPage = (req, res) => {
    res.render('signup', {
        title: 'Sign Up',
        error: req.query.error
    });
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        // Validate input
        if (!email || !password) {
            return res.render('login', {
                error: 'Please provide email and password',
                email
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', {
                error: 'Invalid credentials',
                email
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                error: 'Invalid credentials',
                email
            });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: remember ? '7d' : '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        });

        // Redirect to home page
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            error: 'An error occurred. Please try again.',
            email: req.body.email
        });
    }
};

// Signup user
exports.signup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, terms } = req.body;

        // Validate input
        if (!username || !email || !password || !confirmPassword) {
            return res.render('signup', {
                error: 'Please fill in all fields',
                username,
                email
            });
        }

        if (password !== confirmPassword) {
            return res.render('signup', {
                error: 'Passwords do not match',
                username,
                email
            });
        }

        // Enhanced password validation
        if (password.length < 8) {
            return res.render('signup', {
                error: 'Password must be at least 8 characters long',
                username,
                email
            });
        }

        if (!/[A-Z]/.test(password)) {
            return res.render('signup', {
                error: 'Password must contain at least 1 uppercase letter',
                username,
                email
            });
        }

        if (!/[a-z]/.test(password)) {
            return res.render('signup', {
                error: 'Password must contain at least 1 lowercase letter',
                username,
                email
            });
        }

        if (!/[0-9]/.test(password)) {
            return res.render('signup', {
                error: 'Password must contain at least 1 number',
                username,
                email
            });
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return res.render('signup', {
                error: 'Password must contain at least 1 special character',
                username,
                email
            });
        }

        if (!terms) {
            return res.render('signup', {
                error: 'Please agree to the terms and conditions',
                username,
                email
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', {
                error: 'Email already registered',
                username
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Redirect to home page
        res.redirect('/');
    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', {
            error: 'An error occurred. Please try again.',
            username: req.body.username,
            email: req.body.email
        });
    }
};

// Logout user
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};

// Get forgot password page
exports.getForgotPasswordPage = (req, res) => {
    res.render('forgot-password', {
        title: 'Forgot Password',
        error: req.query.error,
        success: req.query.success
    });
};

// Handle forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.render('forgot-password', {
                error: 'Please enter your email address',
                email: ''
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgot-password', {
                error: 'No account found with that email address',
                email: email
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
        
        // Send reset email
        const emailSent = await sendPasswordResetEmail(user.email, resetUrl);
        
        if (emailSent) {
            res.render('forgot-password', {
                success: 'Password reset instructions have been sent to your email address',
                email: ''
            });
        } else {
            res.render('forgot-password', {
                error: 'Failed to send reset email. Please try again.',
                email: email
            });
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.render('forgot-password', {
            error: 'An error occurred. Please try again.',
            email: req.body.email
        });
    }
};

// Get reset password page
exports.getResetPasswordPage = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('reset-password', {
                error: 'Password reset token is invalid or has expired',
                token: ''
            });
        }

        res.render('reset-password', {
            title: 'Reset Password',
            token: token,
            error: req.query.error
        });
        
    } catch (error) {
        console.error('Reset password page error:', error);
        res.render('reset-password', {
            error: 'An error occurred. Please try again.',
            token: ''
        });
    }
};

// Handle reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // Validate input
        if (!password || !confirmPassword) {
            return res.render('reset-password', {
                error: 'Please fill in all fields',
                token: token
            });
        }

        if (password !== confirmPassword) {
            return res.render('reset-password', {
                error: 'Passwords do not match',
                token: token
            });
        }

        // Enhanced password validation
        if (password.length < 8) {
            return res.render('reset-password', {
                error: 'Password must be at least 8 characters long',
                token: token
            });
        }

        if (!/[A-Z]/.test(password)) {
            return res.render('reset-password', {
                error: 'Password must contain at least 1 uppercase letter',
                token: token
            });
        }

        if (!/[a-z]/.test(password)) {
            return res.render('reset-password', {
                error: 'Password must contain at least 1 lowercase letter',
                token: token
            });
        }

        if (!/[0-9]/.test(password)) {
            return res.render('reset-password', {
                error: 'Password must contain at least 1 number',
                token: token
            });
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return res.render('reset-password', {
                error: 'Password must contain at least 1 special character',
                token: token
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('reset-password', {
                error: 'Password reset token is invalid or has expired',
                token: ''
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Redirect to login with success message
        res.redirect('/auth/login?success=Password has been reset successfully. You can now log in with your new password.');
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.render('reset-password', {
            error: 'An error occurred. Please try again.',
            token: req.params.token
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.render('profile', {
            title: 'Profile',
            user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('error', {
            message: 'An error occurred while fetching your profile'
        });
    }
}; 