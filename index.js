require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const connectDB = require('./models/db');
const { auth, adminAuth } = require('./middleware/auth');
const Product = require('./models/Product');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

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
app.use(session({
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    }
}));

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
    res.status(500).render('error', {
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);

// Protected admin routes
app.use('/api/admin/products', adminAuth, productRoutes);

// Cart Routes
app.get('/cart', (req, res) => {
    try {
        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cart = req.session.cart;
        // Calculate total with proper number parsing
        const total = cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const itemCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        
        // Always provide all required variables
        const viewData = {
            title: 'Shopping Cart | Sense',
            cart: cart,
            total: total,
            itemCount: itemCount,
            user: req.session.user || null
        };

        console.log('Rendering cart with data:', viewData);
        res.render('cart', viewData);
    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading cart',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

app.get('/cart/count', (req, res) => {
    try {
        const cart = req.session.cart || [];
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ count });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({ error: 'Error getting cart count' });
    }
});

app.post('/cart/add/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItem = req.session.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Ensure price is stored as a number
            const price = parseFloat(product.price) || 0;
            req.session.cart.push({
                id: product._id,
                name: product.name,
                price: price,
                image: product.images.main,
                quantity: 1
            });
        }

        // Calculate new total
        const total = req.session.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            return sum + (price * item.quantity);
        }, 0);

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Error adding to cart' });
    }
});

app.post('/cart/remove/:id', (req, res) => {
    try {
        const productId = req.params.id;
        req.session.cart = req.session.cart.filter(item => item.id !== productId);
        
        // Recalculate total with proper number parsing
        const total = req.session.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const cartCount = req.session.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Error removing from cart' });
    }
});

app.post('/cart/update/:id', (req, res) => {
    try {
        const productId = req.params.id;
        const change = parseInt(req.body.change);
        const item = req.session.cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            if (item.quantity === 0) {
                req.session.cart = req.session.cart.filter(i => i.id !== productId);
            }
        }

        // Recalculate total with proper number parsing
        const total = req.session.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const cartCount = req.session.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Error updating cart' });
    }
});

app.post('/cart/checkout', async (req, res) => {
    try {
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).send('Cart is empty');
        }

        // Here you would typically:
        // 1. Create an order in the database
        // 2. Process payment
        // 3. Clear the cart
        // 4. Send confirmation email
        
        // For now, we'll just clear the cart and redirect to home
        req.session.cart = [];
        res.redirect('/');
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Error during checkout');
    }
});

// Checkout Routes
app.get('/checkout', (req, res) => {
    try {
        console.log('Accessing checkout route');
        console.log('Session:', req.session);
        
        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            console.log('No cart in session, initializing empty cart');
            req.session.cart = [];
        }

        const cart = req.session.cart;
        console.log('Cart contents:', cart);
        
        if (!cart || cart.length === 0) {
            console.log('Cart is empty, redirecting to cart page');
            return res.redirect('/cart');
        }
        
        // Calculate total with proper number parsing
        const total = cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const itemCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        
        // Always provide all required variables
        const viewData = {
            title: 'Checkout | Sense',
            cart: cart,
            total: total,
            itemCount: itemCount,
            user: req.session.user || null
        };

        console.log('Rendering checkout with data:', viewData);
        res.render('checkout', viewData);
    } catch (error) {
        console.error('Error loading checkout:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading checkout',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

app.post('/checkout/process', (req, res) => {
    try {
        // Here you would typically:
        // 1. Process the payment
        // 2. Create an order in the database
        // 3. Clear the cart
        // 4. Send confirmation email
        
        // For now, we'll just clear the cart and redirect to a success page
        req.session.cart = [];
        
        res.redirect('/checkout/success');
    } catch (error) {
        console.error('Error processing checkout:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error processing checkout',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

app.get('/checkout/success', (req, res) => {
    res.render('checkout-success', {
        title: 'Order Confirmed | Sense',
        user: req.session.user || null
    });
});

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

// Category Routes
app.get('/dining', async (req, res) => {
    try {
        const products = await Product.find({ category: 'Dining' });
        res.render('dining', { products });
    } catch (error) {
        console.error('Error fetching dining products:', error);
        res.status(500).send('Error loading products');
    }
});

app.get('/bedroom', async (req, res) => {
    try {
        const products = await Product.find({ category: 'Bedroom' });
        res.render('bedroom', { products });
    } catch (error) {
        console.error('Error fetching bedroom products:', error);
        res.status(500).send('Error loading products');
    }
});

app.get('/living', async (req, res) => {
    try {
        const products = await Product.find({ category: 'Living Room' });
        res.render('living', { products });
    } catch (error) {
        console.error('Error fetching living room products:', error);
        res.status(500).send('Error loading products');
    }
});

app.get('/kitchen', async (req, res) => {
    try {
        const products = await Product.find({ category: 'Kitchen' });
        res.render('kitchen', { products });
    } catch (error) {
        console.error('Error fetching kitchen products:', error);
        res.status(500).send('Error loading products');
    }
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

// Add Product Page
app.get('/admin/add-product', (req, res) => {
    res.render('admin/add-product');
});

// Admin Products Page
app.get('/admin/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { 
            title: 'Product Management',
            products: products,
            active: 'products'
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error loading products');
    }
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