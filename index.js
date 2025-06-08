require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./models/db');
const { auth, adminAuth } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');

// Initialize express app
const app = express();

// Set default JWT secret if not in environment
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not set in environment variables. Using default secret key.');
    process.env.JWT_SECRET = 'your-secret-key-for-development';
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).render('error', {
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Protected admin routes
app.use('/api/admin/rooms', adminAuth, roomRoutes);
app.use('/api/admin/bookings', adminAuth, bookingRoutes);

// Basic routes
app.get('/', (req, res) => {
    console.log('Rendering home page');
    res.render('home');
});

app.get('/login', (req, res) => {
    console.log('Rendering login page');
    res.render('login', { title: 'Login' });
});

app.get('/signup', (req, res) => {
    console.log('Rendering signup page');
    res.render('signup', { title: 'Sign Up' });
});

// Combined Dining Room Page
app.get('/dining', (req, res) => {
    res.render('dining');
});

// Individual Dining Room Product Pages
app.get('/dining/dining1', (req, res) => {
    res.render('dining/dining1', { 
        product: {
            title: 'Traditional Dining Set',
            price: '£1,499',
            availability: 'In Stock',
            description: 'Transform your dining with this traditional dining set. It includes a solid wood table with a rich mahogany finish and six upholstered chairs for ultimate comfort.'
        }
    });
});

app.get('/dining/dining2', (req, res) => {
    res.render('dining/dining2', {
        product: {
            title: 'Modern Dining Set',
            price: '£1,599',
            availability: 'In Stock',
            description: 'Upgrade your dining space with this modern dining set. Featuring a sleek glass table and four contemporary chairs, this set is perfect for any modern home.'
        }
    });
});

app.get('/dining/dining3', (req, res) => {
    res.render('dining/dining3', {
        product: {
            title: 'Vintage Dining Set',
            price: '£1,800',
            availability: 'In Stock',
            description: 'Add character to your home with this vintage dining set. The distressed wood finish and classic design create a timeless look.'
        }
    });
});

app.get('/dining/dining4', (req, res) => {
    res.render('dining/dining4', {
        product: {
            title: 'Rustic Dining Set',
            price: '£165',
            availability: 'In Stock',
            description: 'Bring natural warmth to your dining room with this rustic dining set. Made from reclaimed wood with a natural finish.'
        }
    });
});

app.get('/dining/dining5', (req, res) => {
    res.render('dining/dining5', {
        product: {
            title: 'Marble Granite Dining Set',
            price: '£450',
            availability: 'In Stock',
            description: 'Elegant marble and granite dining set that combines luxury with durability. Perfect for both casual and formal dining.'
        }
    });
});

app.get('/dining/dining6', (req, res) => {
    res.render('dining/dining6', {
        product: {
            title: 'Glass Modernity Dining Set',
            price: '£550',
            availability: 'In Stock',
            description: 'Contemporary glass dining set that brings light and space to your dining area. Features a tempered glass table with modern metal frame.'
        }
    });
});

// Kitchen Route
app.get('/kitchen', (req, res) => {
    res.render('kitchen');
});

// Living Room Page
app.get('/living', (req, res) => {
    res.render('living');
});

// Bedroom Page
app.get('/bedroom', (req, res) => {
    res.render('bedroom');
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Page not found:', req.url);
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- GET  /');
    console.log('- GET  /login');
    console.log('- GET  /signup');
    console.log('- GET  /auth/login');
    console.log('- POST /auth/login');
    console.log('- GET  /auth/signup');
    console.log('- POST /auth/signup');
});