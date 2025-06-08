const products = require('../models/productModel');

exports.getProductsPage = (req, res) => {
    res.render('products', { title: 'Manage Products', products });
};