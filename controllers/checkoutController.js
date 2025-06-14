const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const parsePrice = require('../utils/priceParser');

// Get checkout page
exports.getCheckoutPage = async (req, res) => {
    try {
        console.log('Accessing checkout route');
        console.log('User ID from auth:', req.user.userId);
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            console.log('User not found in DB, redirecting to login');
            return res.redirect('/auth/login');
        }

        const cart = user.cart || [];
        console.log('Cart contents for checkout:', cart);
        
        if (!cart || cart.length === 0) {
            console.log('Cart is empty, redirecting to cart page');
            return res.redirect('/cart');
        }
        
        const total = cart.reduce((sum, item) => {
            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        
        const itemCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        
        const viewData = {
            title: 'Checkout | Sense',
            cart: cart,
            total: total,
            itemCount: itemCount,
            user: res.locals.user
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
};

// Process checkout
exports.processCheckout = async (req, res) => {
    try {
        console.log('Starting checkout process...');
        
        console.log('User ID:', req.user.userId);
        const user = await User.findById(req.user.userId);
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user || !user.cart || user.cart.length === 0) {
            console.log('Cart validation failed:', { 
                userExists: !!user, 
                hasCart: !!user?.cart, 
                cartLength: user?.cart?.length 
            });
            return res.status(400).json({ error: 'Cart is empty' });
        }

        console.log('Cart contents:', user.cart);

        const processedItems = [];
        let total = 0;

        for (const item of user.cart) {
            console.log('Processing cart item:', item);
            
            if (!item.id || !item.name || !item.price || !item.quantity) {
                console.error('Invalid cart item structure:', item);
                return res.status(400).json({ error: 'Invalid cart item structure' });
            }

            if (!mongoose.Types.ObjectId.isValid(item.id)) {
                console.error('Invalid product ID:', item.id);
                return res.status(400).json({ error: 'Invalid product ID in cart' });
            }

            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 0;

            if (isNaN(price) || price <= 0) {
                console.error('Invalid price for item:', item.name, 'Price:', item.price);
                return res.status(400).json({ error: 'Invalid price in cart' });
            }

            if (quantity <= 0) {
                console.error('Invalid quantity for item:', item.name, 'Quantity:', item.quantity);
                return res.status(400).json({ error: 'Invalid quantity in cart' });
            }

            processedItems.push({
                product: item.id,
                quantity: quantity,
                price: price
            });

            total += price * quantity;
        }

        console.log('Processed items:', processedItems);
        console.log('Calculated total:', total);

        const { fullName, email, phone, address, city, postalCode } = req.body;
        
        if (!fullName || !email || !phone || !address || !city || !postalCode) {
            console.error('Missing required shipping information');
            return res.status(400).json({ error: 'Missing required shipping information' });
        }

        console.log('Form data:', {
            fullName: fullName,
            email: email,
            phone: phone,
            address: address,
            city: city,
            postalCode: postalCode
        });

        const orderData = {
            user: user._id,
            products: processedItems,
            total: total,
            shippingAddress: {
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
                city: city.trim(),
                postalCode: postalCode.trim()
            }
        };
        console.log('Order data prepared:', orderData);

        const newOrder = new Order(orderData);
        console.log('Order instance created');

        await newOrder.save();
        console.log('Order saved successfully');

        user.cart = [];
        await user.save();
        console.log('User cart cleared');

        res.redirect('/checkout/success');
    } catch (error) {
        console.error('Detailed checkout error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            console.error('Validation errors:', validationErrors);
            return res.status(400).json({ error: `Validation error: ${validationErrors.join(', ')}` });
        }
        
        if (error.code === 11000) {
            console.error('Duplicate key error:', error);
            
            if (error.keyPattern && error.keyPattern.orderNumber) {
                console.error('Duplicate orderNumber error - retrying with new orderNumber');
                return res.status(500).json({ error: 'Error creating order. Please try again.' });
            }
            
            return res.status(400).json({ error: 'Order already exists' });
        }
        
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error processing checkout',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Get checkout success page
exports.getCheckoutSuccessPage = (req, res) => {
    res.render('checkout-success', {
        title: 'Order Confirmed | Sense',
        user: req.session.user || null
    });
}; 