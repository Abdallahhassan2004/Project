const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const parsePrice = require('../utils/priceParser');

// Get cart page
exports.getCartPage = async (req, res) => {
    try {
        console.log('=== LOADING CART PAGE ===');
        console.log('User ID:', req.user.userId);
        
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
            const price = parsePrice(item.price);
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
};

// Get cart count
exports.getCartCount = async (req, res) => {
    try {
        const token = req.cookies.token;
        let count = 0;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId);
                
                if (user && user.cart) {
                    count = user.cart.reduce((sum, item) => sum + item.quantity, 0);
                }
            } catch (error) {
                console.log('Invalid token in cart count request');
            }
        }
        
        res.json({ count });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({ error: 'Error getting cart count' });
    }
};

// Add product to cart
exports.addProductToCart = async (req, res) => {
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

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'User not found' });
        }

        console.log('User found:', user.username);
        console.log('Current cart before update:', user.cart);

        if (!user.cart) {
            user.cart = [];
            console.log('Initialized empty cart');
        }

        const existingItem = user.cart.find(item => item.id.toString() === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Updated existing item quantity:', existingItem.quantity);
        } else {
            let imagePath;
            if (product.images && product.images.main) {
                imagePath = product.images.main;
                console.log('Using images.main path:', imagePath);
            } else if (product.image) {
                imagePath = product.image;
                console.log('Using image path:', imagePath);
            } else {
                imagePath = 'default.jpg';
                console.log('Using default image path');
            }
            
            const newItem = {
                id: product._id,
                name: product.name,
                price: parsePrice(product.price),
                image: imagePath,
                quantity: 1
            };
            user.cart.push(newItem);
            console.log('Added new item to cart:', newItem);
        }

        console.log('Cart after update:', user.cart);

        await user.save();
        console.log('User cart saved successfully');

        const total = user.cart.reduce((sum, item) => {
            const price = parsePrice(item.price);
            return sum + (price * item.quantity);
        }, 0);

        const cartCount = user.cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Final cart count:', cartCount, 'Total:', total);
        
        // Notify clients about cart update
        notifyCartClients({ type: 'cartUpdate', count: cartCount });

        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Error adding to cart' });
    }
};

// Remove product from cart
exports.removeProductFromCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        user.cart = user.cart.filter(item => item.id.toString() !== productId);
        await user.save();
        
        const total = user.cart.reduce((sum, item) => {
            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const cartCount = user.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        // Notify clients about cart update
        notifyCartClients({ type: 'cartUpdate', count: cartCount });

        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Error removing from cart' });
    }
};

// Update product quantity in cart
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const change = parseInt(req.body.change);
        
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

        const total = user.cart.reduce((sum, item) => {
            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const cartCount = user.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        // Notify clients about cart update
        notifyCartClients({ type: 'cartUpdate', count: cartCount });

        res.json({ success: true, cartCount, total });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Error updating cart' });
    }
};

// Server-Sent Events for real-time cart notifications
exports.getCartEvents = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    if (!global.cartNotificationClients) {
        global.cartNotificationClients = new Set();
    }
    global.cartNotificationClients.add(res);

    req.on('close', () => {
        global.cartNotificationClients.delete(res);
    });
};

// Function to notify all connected clients about cart changes
function notifyCartClients(data) {
    if (global.cartNotificationClients) {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        global.cartNotificationClients.forEach(client => {
            try {
                client.write(message);
            } catch (error) {
                global.cartNotificationClients.delete(client);
            }
        });
    }
}

// Make notifyCartClients globally available (if still needed, consider dependency injection instead)
global.notifyCartClients = notifyCartClients; // Consider removing this global if not strictly necessary and pass via context 