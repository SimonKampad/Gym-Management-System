const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. GET: Show the Login Page
router.get('/login', (req, res) => {
    res.render('login'); 
});

// 2. POST: Process Login Data
router.post('/login', async (req, res) => {
    // We use "username" here because that is the 'name' attribute in your login.ejs input
    const { username, password } = req.body;

    try {
        let user = null;
        let userRole = '';

        // --- STEP 1: CHECK ADMIN COLLECTION ---
        // Admins login via 'username' field
        user = await Admin.findOne({ username: username });
        
        if (user) {
            userRole = 'admin';
        } else {
            // --- STEP 2: CHECK MEMBER COLLECTION ---
            // Members login via 'email' field
            user = await Member.findOne({ email: username });
            if (user) {
                userRole = 'member';
            }
        }

        // --- STEP 3: VALIDATE PASSWORD ---
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/login');
        }

        let isPasswordValid = false;
        if (userRole === 'admin') {
            // Admin uses hashed password (bcrypt)
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            // Member uses plain text Phone Number (default password)
            // We check against user.password OR user.phone just in case
            isPasswordValid = (password === user.password || password === user.phone);
        }

        if (!isPasswordValid) {
            req.flash('error_msg', 'Invalid Password');
            return res.redirect('/login');
        }

        // --- STEP 4: GENERATE TOKEN ---
        const token = jwt.sign(
            { id: user._id, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true });

        // --- STEP 5: REDIRECT ---
        if (userRole === 'admin') {
            console.log("Admin logged in successfully");
            return res.redirect('/dashboard');
        } else {
            console.log("Member logged in successfully");
            return res.redirect('/member/dashboard');
        }

    } catch (err) {
        console.error("Login Error:", err);
        req.flash('error_msg', 'Server error during login');
        res.redirect('/login');
    }
});

// 3. GET: Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router;