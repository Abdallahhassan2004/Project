require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const connectDB = require('./models/db');
const { auth, adminAuth, requireAuth } = require('./middleware/auth');
const userData = require('./middleware/userData');
const Product = require('./models/Product');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminController = require('./controllers/adminController');

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
    res.status(500).render('error', {
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Routes
app.use('/auth', authRoutes);

// Admin routes
app.get('/admin', adminAuth, adminController.getAdminPage);
app.get('/admin/users', adminAuth, adminController.getUsersPage);
app.get('/admin/orders', adminAuth, adminController.getOrdersPage);

// Test admin route for debugging
app.get('/admin/test', adminAuth, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Admin authentication working',
        user: req.user 
    });
});

// Test admin authentication
app.get('/api/admin/test-auth', adminAuth, (req, res) => {
    res.json({ 
        message: 'Admin authentication working',
        user: req.user 
    });
});

// Test product routes
app.get('/api/admin/test-products', adminAuth, async (req, res) => {
    try {
        const products = await Product.find().limit(1);
        res.json({ 
            message: 'Product routes working',
            productCount: products.length,
            sampleProduct: products[0] ? { id: products[0]._id, name: products[0].name } : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error testing products', error: error.message });
    }
});

// Add user route
app.post('/admin/add-user', adminAuth, async (req, res) => {
    try {
        console.log('=== ADDING NEW USER ===');
        console.log('Route reached successfully');
        console.log('Request body:', req.body);
        console.log('User making request:', req.user);
        
        const { username, email, password, role } = req.body;
        
        // Validation
        if (!username || !email || !password || !role) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Username validation
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }
        
        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
        }
        
        if (!/(?=.*\d)/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one number' });
        }
        
        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one special character' });
        }
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        // Check if email already exists
        const User = require('./models/User');
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        // Check if username already exists
        const existingUsername = await User.findOne({ username: username });
        
        if (existingUsername) {
            console.log('Username already exists:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role
        });
        
        await newUser.save();
        console.log('User created successfully:', newUser.username);
        console.log('=== END ADDING USER ===');
        
        res.status(201).json({ 
            success: true, 
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error adding user:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `${field} already exists` });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user route
app.delete('/admin/delete-user/:userId', adminAuth, async (req, res) => {
    try {
        console.log('=== DELETING USER ===');
        console.log('User ID to delete:', req.params.userId);
        console.log('Admin making request:', req.user);
        
        const { userId } = req.params;
        
        // Validate user ID
        if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        // Check if user exists
        const User = require('./models/User');
        const userToDelete = await User.findById(userId);
        
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Prevent admin from deleting themselves
        if (userToDelete._id.toString() === req.user.userId) {
            return res.status(400).json({ error: 'You cannot delete your own account' });
        }
        
        // Prevent deleting the last admin (if this is an admin being deleted)
        if (userToDelete.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        console.log('User deleted successfully:', userToDelete.username);
        console.log('=== END DELETING USER ===');
        
        res.json({ 
            success: true, 
            message: 'User deleted successfully',
            deletedUser: {
                id: userToDelete._id,
                username: userToDelete.username,
                email: userToDelete.email,
                role: userToDelete.role
            }
        });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected admin routes
app.use('/api/admin/products', adminAuth, productRoutes);

// Cart Routes
app.get('/cart', requireAuth, async (req, res) => {
    try {
        console.log('=== LOADING CART PAGE ===');
        console.log('User ID:', req.user.userId);
        
        const User = require('./models/User');
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            console.log('User not found, redirecting to login');
            return res.redirect('/auth/login');
        }

        console.log('User found:', user.username);
        console.log('User cart from database:', user.cart);
        
        const cart = user.cart || [];
        console.log('Cart array:', cart);
        console.log('Cart length:', cart.length);
        
        // Calculate total with proper number parsing
        const total = cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const itemCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        
        console.log('Calculated total:', total);
        console.log('Calculated item count:', itemCount);
        
        // Always provide all required variables
        const viewData = {
            title: 'Shopping Cart | Sense',
            cart: cart,
            total: total,
            itemCount: itemCount,
            user: res.locals.user
        };

        console.log('Rendering cart with data:', viewData);
        console.log('=== END LOADING CART PAGE ===');
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

app.get('/cart/count', async (req, res) => {
    try {
        // Check if user is authenticated using the same logic as userData middleware
        const token = req.cookies.token;
        let count = 0;
        
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const User = require('./models/User');
                const user = await User.findById(decoded.userId);
                
                if (user && user.cart) {
                    count = user.cart.reduce((sum, item) => sum + item.quantity, 0);
                }
            } catch (error) {
                // Invalid token, return 0 count
                console.log('Invalid token in cart count request');
            }
        }
        
        res.json({ count });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({ error: 'Error getting cart count' });
    }
});

app.post('/cart/add/:id', auth, async (req, res) => {
    try {
        const productId = req.params.id;
        console.log('=== ADDING PRODUCT TO CART ===');
        console.log('Product ID:', productId);
        console.log('User ID:', req.user.userId);
        
        const product = await Product.findById(productId);
        
        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log('Found product:', product.name);
        console.log('Product structure:', {
            name: product.name,
            price: product.price,
            hasImages: !!product.images,
            hasImage: !!product.image,
            imagesMain: product.images?.main,
            image: product.image
        });

        // Get user from database
        const User = require('./models/User');
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'User not found' });
        }

        console.log('User found:', user.username);
        console.log('Current cart before update:', user.cart);

        // Initialize cart if it doesn't exist
        if (!user.cart) {
            user.cart = [];
            console.log('Initialized empty cart');
        }

        // Check if item already exists in cart
        const existingItem = user.cart.find(item => item.id.toString() === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Updated existing item quantity:', existingItem.quantity);
        } else {
            // Add new item to cart
            let imagePath;
            if (product.images && product.images.main) {
                // Living/Dining products
                imagePath = product.images.main;
                console.log('Using images.main path:', imagePath);
            } else if (product.image) {
                // Bedroom/Kitchen products
                imagePath = product.image;
                console.log('Using image path:', imagePath);
            } else {
                imagePath = 'default.jpg';
                console.log('Using default image path');
            }
            
            const newItem = {
                id: product._id,
                name: product.name,
                price: parseFloat(product.price) || 0,
                image: imagePath,
                quantity: 1
            };
            user.cart.push(newItem);
            console.log('Added new item to cart:', newItem);
        }

        console.log('Cart after update:', user.cart);

        // Save user with updated cart
        await user.save();
        console.log('User cart saved successfully');

        // Calculate new total and count
        const total = user.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            return sum + (price * item.quantity);
        }, 0);

        const cartCount = user.cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Final cart count:', cartCount, 'Total:', total);
        console.log('=== END ADDING PRODUCT ===');
        
        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Error adding to cart' });
    }
});

app.post('/cart/remove/:id', auth, async (req, res) => {
    try {
        const productId = req.params.id;
        const User = require('./models/User');
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Remove item from cart
        user.cart = user.cart.filter(item => item.id.toString() !== productId);
        await user.save();
        
        // Recalculate total with proper number parsing
        const total = user.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const cartCount = user.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Error removing from cart' });
    }
});

app.post('/cart/update/:id', auth, async (req, res) => {
    try {
        const productId = req.params.id;
        const change = parseInt(req.body.change);
        
        const User = require('./models/User');
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const item = user.cart.find(item => item.id.toString() === productId);
        
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            if (item.quantity === 0) {
                user.cart = user.cart.filter(i => i.id.toString() !== productId);
            }
        }

        await user.save();

        // Recalculate total with proper number parsing
        const total = user.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const cartCount = user.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
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
app.get('/checkout', requireAuth, async (req, res) => {
    try {
        console.log('Accessing checkout route');
        console.log('User ID from auth:', req.user.userId);
        
        const User = require('./models/User');
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            console.log('User not found in DB, redirecting to login');
            return res.redirect('/auth/login');
        }

        const cart = user.cart || []; // Get cart from user document
        console.log('Cart contents for checkout:', cart);
        
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
            user: res.locals.user // Use res.locals.user for template user data
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

app.post('/checkout/process', auth, async (req, res) => {
    try {
        const User = require('./models/User');
        const Order = require('./models/Order');
        const user = await User.findById(req.user.userId);

        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total
        const total = user.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);

        // Create new order
        const newOrder = new Order({
            user: user._id,
            products: user.cart.map(item => ({
                product: item.id,
                quantity: item.quantity
            })),
            total: total,
            status: 'Pending'
        });

        await newOrder.save();

        // Clear the user's cart
        user.cart = [];
        await user.save();

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
app.get('/admin/add-product', adminAuth, (req, res) => {
    res.render('admin/add-product');
});

// Handle Add Product Form Submission
app.post('/admin/add-product', adminAuth, async (req, res) => {
    try {
        console.log('Received form data:', req.body);
        
        const { name, category, price, description, mainImage, thumbnails, alt } = req.body;
        
        // Validate required fields
        if (!name || !category || !price || !description || !mainImage || !thumbnails || !alt) {
            console.log('Missing fields:', { name, category, price, description, mainImage, thumbnails, alt });
            return res.status(400).send('All fields are required');
        }
        
        // Process thumbnails (split by newline and filter empty lines)
        const thumbnailArray = thumbnails.split('\n')
            .map(thumbnail => thumbnail.trim())
            .filter(thumbnail => thumbnail.length > 0);
        
        if (thumbnailArray.length === 0) {
            return res.status(400).send('At least one thumbnail image is required');
        }
        
        // Create new product
        const newProduct = new Product({
            name: name.trim(),
            category: category,
            price: `EGP ${parseFloat(price).toFixed(2)}`,
            description: description.trim(),
            images: {
                main: mainImage.trim(),
                thumbnails: thumbnailArray
            },
            alt: alt.trim()
        });
        
        // Save to database
        const savedProduct = await newProduct.save();
        
        console.log('Product added successfully:', savedProduct);
        res.status(201).json({ 
            success: true, 
            message: 'Product added successfully',
            product: savedProduct 
        });
        
    } catch (error) {
        console.error('Error adding product:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).send(`Validation Error: ${validationErrors.join(', ')}`);
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).send('A product with this name already exists');
        }
        
        res.status(500).send('Internal server error while adding product');
    }
});

// Admin Products Page
app.get('/admin/products', adminAuth, async (req, res) => {
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

// Get cart cleanup notifications
app.get('/api/cart/notifications', async (req, res) => {
    try {
        // This endpoint can be used to check if any products were removed from cart
        // For now, we'll return a simple status
        res.json({ 
            message: 'Cart is up to date',
            lastChecked: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking cart notifications' });
    }
});

// Server-Sent Events for real-time cart notifications
app.get('/api/cart/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial connection message
    res.write('data: {"type": "connected", "message": "Cart notification stream connected"}\n\n');

    // Store the response object for later use
    if (!global.cartNotificationClients) {
        global.cartNotificationClients = new Set();
    }
    global.cartNotificationClients.add(res);

    // Remove client when connection closes
    req.on('close', () => {
        global.cartNotificationClients.delete(res);
    });
});

// Function to notify all connected clients about cart changes
function notifyCartClients(data) {
    if (global.cartNotificationClients) {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        global.cartNotificationClients.forEach(client => {
            try {
                client.write(message);
            } catch (error) {
                // Remove disconnected clients
                global.cartNotificationClients.delete(client);
            }
        });
    }
}

// Make notifyCartClients globally available
global.notifyCartClients = notifyCartClients;

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