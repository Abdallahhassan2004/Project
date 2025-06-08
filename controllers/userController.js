const users = require('../models/userModel');

exports.getUsersPage = (req, res) => {
    res.render('users', { title: 'Manage Users', users });
};