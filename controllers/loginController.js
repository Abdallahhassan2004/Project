exports.getLoginPage = (req, res) => {
    res.render('login', { title: 'Login' });
};