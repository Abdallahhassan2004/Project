const Product = require('../models/Product');

exports.getHomePage = (req, res) => {
    console.log('Rendering home page');
    res.render('home');
};

exports.getLoginPage = (req, res) => {
    console.log('Rendering login page');
    res.render('login', { title: 'Login' });
};

exports.getSignupPage = (req, res) => {
    console.log('Rendering signup page');
    res.render('signup', { title: 'Sign Up' });
};

exports.getDiningPage = async (req, res) => {
    try {
        const products = await Product.find({ category: 'Dining' });
        res.render('dining', { products });
    } catch (error) {
        console.error('Error fetching dining products:', error);
        res.status(500).send('Error loading products');
    }
};

exports.getBedroomPage = async (req, res) => {
    try {
        const products = await Product.find({ category: 'Bedroom' });
        res.render('bedroom', { products });
    } catch (error) {
        console.error('Error fetching bedroom products:', error);
        res.status(500).send('Error loading products');
    }
};

exports.getLivingPage = async (req, res) => {
    try {
        const products = await Product.find({ category: 'Living Room' });
        res.render('living', { products });
    } catch (error) {
        console.error('Error fetching living room products:', error);
        res.status(500).send('Error loading products');
    }
};

exports.getKitchenPage = async (req, res) => {
    try {
        const products = await Product.find({ category: 'Kitchen' });
        res.render('kitchen', { products });
    } catch (error) {
        console.error('Error fetching kitchen products:', error);
        res.status(500).send('Error loading products');
    }
}; 