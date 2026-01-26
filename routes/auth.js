const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. GET: Show the Login Page
router.get('/login', (req, res) => {
    res.render('login'); // This looks for views/login.ejs
});

// 2. POST: Process Login Data
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.send('Invalid Username or Password');

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.send('Invalid Username or Password');

        // Create Token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Save Token in Cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 3. GET: Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router;