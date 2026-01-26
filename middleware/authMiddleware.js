const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next(); // Proceed to the dashboard
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};