require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const connectDB = require('./models/db');
const { auth, adminAuth, requireAuth } = require('./middleware/auth');
const userData = require('./middleware/userData');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const pageRoutes = require('./routes/pageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();

// Set default JWT secret if not in environment
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not set in environment variables. Using default secret key.');
    process.env.JWT_SECRET = 'd8a6a937cabdcd3cbefa25972833067aa96d9c30b0cb1f0861dce7c50554135a';
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'd8a6a937cabdcd3cbefa25972833067aa96d9c30b0cb1f0861dce7c50554135a',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Apply userData middleware globally to make user data available to all templates
app.use(userData);

// Add session check middleware
app.use((req, res, next) => {
    console.log('Session middleware - Current session:', req.session);
    if (!req.session.cart) {
        console.log('Initializing empty cart in session');
        req.session.cart = [];
    }
    next();
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Session:', req.session);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));
app.use('/JavaScript', express.static(path.join(__dirname, 'public/JavaScript')));
app.use('/Images', express.static(path.join(__dirname, 'public/Images')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    console.error('Error stack:', err.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('Request body:', req.body);
    
    res.status(500).render('error', {
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Mount routes
app.use('/', pageRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    console.log('404 - Page not found:', req.url);
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Connect to MongoDB
connectDB()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Set port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});