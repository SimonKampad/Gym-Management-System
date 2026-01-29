const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const Member = require('../models/Member');
const auth = require('../middleware/authMiddleware');
const { sendGeneralNotice } = require('../utils/emailService');
const Attendance = require('../models/Attendance');
const QRCode = require('qrcode');

// Middleware to ensure only admins can post
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).send("Access Denied");
};

// GET: Show Notice Form and Past Notices
router.get('/admin/notices', auth, isAdmin, async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.render('admin/notices', { notices });
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// POST: Create Notice and Email Members
router.post('/admin/notices/add', auth, isAdmin, async (req, res) => {
    try {
        const { title, content, type, sendEmail } = req.body;

        // 1. Save to Database for the Notice Board
        const notice = new Notice({ title, content, type });
        await notice.save();

        // 2. If 'Send Email' checkbox was checked, blast to all members
        if (sendEmail === 'on') {
            const members = await Member.find({}, 'email name');
            
            console.log(`Attempting to send ${members.length} emails...`);

            // Use Promise.all to send emails in parallel
            await Promise.all(members.map(member => 
                sendGeneralNotice(member.email, member.name, title, content)
            ));
            
            console.log("All emails sent successfully.");
            req.flash('success_msg', 'Notice posted and emails sent to all members!');
        } else {
            req.flash('success_msg', 'Notice posted successfully!');
        }

        // Redirect back to the Notices page so you can see the updated list
        res.redirect('/admin/notices');
    } catch (err) {
        console.error("Error in /admin/notices/add:", err);
        req.flash('error_msg', 'Failed to post notice: ' + err.message);
        res.redirect('/admin/notices');
    }
});

// const QRCode = require('qrcode'); // Install this: npm install qrcode



router.get('/admin/attendance/generate', auth, isAdmin, async (req, res) => {
    try {
        // Create a unique code for today: e.g., "GYM-2024-05-20"
        const todayCode = `GYM-${new Date().toISOString().split('T')[0]}`;
        
        // Generate the QR as a DataURL (image string)
        const qrImage = await QRCode.toDataURL(todayCode);
        
        res.render('admin/generate-qr', { qrImage, todayCode });
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// 2. GET: View the Attendance List
router.get('/admin/attendance/list', auth, isAdmin, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // We use .populate('member') to get the member's Name and Email
        const attendance = await Attendance.find({
            date: { $gte: startOfDay }
        }).populate('member').sort({ date: -1 });

        res.render('admin/attendance-list', { attendance });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
});

module.exports = router;