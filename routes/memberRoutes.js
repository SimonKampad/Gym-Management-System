const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const auth = require('../middleware/authMiddleware');
const Plan = require('../models/Plan'); // Import the Plan model
const Attendance = require('../models/Attendance');

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send("Access Denied: Admins Only");
    }
};



// 1. GET: Show all members in a table
router.get('/members', auth, isAdmin,async (req, res) => {
    const members = await Member.find().populate('plan'); // THIS IS THE KEY
    const plans = await Plan.find();
    res.render('members/index', { members, plans });
});

router.get('/member/dashboard', auth, async (req, res) => {
    try {
        // Find the member using the ID stored in the JWT token
        const member = await Member.findById(req.user.id).populate('plan');
        
        // Calculate days remaining
        const today = new Date();
        const diffTime = member.expiryDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        res.render('member/dashboard', { 
            member, 
            daysLeft: daysLeft > 0 ? daysLeft : 0 
        });
    } catch (err) {
        res.redirect('/login');
    }
});

// GET: Show the BMI Page
router.get('/member/bmi', auth, (req, res) => {
    res.render('member/bmi');
});

router.get('/member/workouts', auth, (req, res) => {
    // We can define categories here or pull them from a database later
    const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio'];
    res.render('member/workouts', { categories });
});

router.get('/member/diet', auth, (req, res) => {
    res.render('member/diet');
});

// GET: Show Progress Page
router.get('/member/progress', auth, async (req, res) => {
    const member = await Member.findById(req.user.id);
    res.render('member/progress', { member });
});

// POST: Add New Weight Entry
router.post('/member/progress/add', auth, async (req, res) => {
    try {
        const { weight } = req.body;
        await Member.findByIdAndUpdate(req.user.id, {
            $push: { weightHistory: { weight: weight, date: new Date() } }
        });
        req.flash('success_msg', 'Weight logged successfully!');
        res.redirect('/member/progress');
    } catch (err) {
        res.redirect('/member/dashboard');
    }
});

// 1. GET: Show the Scan Page
router.get('/member/scan', auth, (req, res) => {
    res.render('member/scan'); // This looks for views/member/scan.ejs
});

router.post('/member/attendance/checkin', auth, async (req, res) => {
    try {
        const { scannedCode } = req.body;
        const todayCode = `GYM-${new Date().toISOString().split('T')[0]}`;

        if (scannedCode !== todayCode) {
            return res.json({ success: false, message: "Invalid or Expired QR Code" });
        }

        // Check if already checked in today
        const startOfDay = new Date().setHours(0,0,0,0);
        const alreadyIn = await Attendance.findOne({
            member: req.user.id,
            date: { $gte: startOfDay }
        });

        if (alreadyIn) {
            return res.json({ success: false, message: "Already checked in today!" });
        }

        const newRecord = new Attendance({ member: req.user.id });
        await newRecord.save();

        res.json({ success: true, message: "Check-in successful! Have a great workout." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// routes/memberRoutes.js

router.get('/member/calories', auth, async (req, res) => {
    try {
        // CRITICAL: You must fetch the member data first!
        const member = await Member.findById(req.user.id);
        
        if (!member) {
            req.flash('error_msg', 'Member not found');
            return res.redirect('/login');
        }

        // Pass the 'member' object to the EJS file
        res.render('member/calories', { member });
    } catch (err) {
        console.error("Error loading calorie calculator:", err);
        res.redirect('/member/dashboard');
    }
});

// 2. POST: Process the 'Add Member' form
router.post('/members/add', auth,isAdmin, async (req, res) => {
    try {
        const { name, email, phone, age, gender, plan, startDate } = req.body;

        // 1. Fetch the selected plan to get its duration
        const selectedPlan = await Plan.findById(plan);
        
        // 2. Calculate Expiry Date
        const start = new Date(startDate);
        const expiry = new Date(startDate);
        expiry.setDate(start.getDate() + selectedPlan.durationInDays);

        // 3. Save Member
        const newMember = new Member({
            name, email, phone, age, gender,
            plan: selectedPlan._id, // Save the ID
            startDate: start,
            expiryDate: expiry
        });

        await newMember.save();
        req.flash('success_msg', 'Member added with expiry: ' + expiry.toDateString());
        res.redirect('/members');
    } catch (err) {
        req.flash('error_msg', 'Error: ' + err.message);
        res.redirect('/members');
    }
});

// 1. GET: Show Edit Form
router.get('/members/edit/:id', auth,isAdmin, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        const plans = await Plan.find(); // Fetch all plans
        res.render('members/edit', { member, plans }); // Pass BOTH member and plans
    } catch (err) {
        res.redirect('/members');
    }
});

// 2. POST: Update Member Data
router.post('/members/edit/:id', auth, isAdmin, async (req, res) => {
    try {
        const { name, email, phone, age, gender, plan, startDate } = req.body;
        
        const selectedPlan = await Plan.findById(plan);
        if (!selectedPlan) throw new Error("Plan not found");

        const start = new Date(startDate);
        const expiry = new Date(startDate);
        expiry.setDate(start.getDate() + selectedPlan.durationInDays);

        // We use { new: true, runValidators: true } to ensure it updates correctly
        await Member.findByIdAndUpdate(req.params.id, {
            name, email, phone, age, gender,
            plan: selectedPlan._id,
            startDate: start,
            expiryDate: expiry
        }, { new: true, runValidators: true });

        req.flash('success_msg', 'Member updated successfully!');
        res.redirect('/members');
    } catch (err) {
        if (err.code === 11000) {
            req.flash('error_msg', 'Update failed: This email is already registered to another member.');
        } else {
            req.flash('error_msg', 'Update failed: ' + err.message);
        }
        res.redirect('/members');
    }
});

// 3. GET: Delete a member
router.get('/members/delete/:id', auth, isAdmin, async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.redirect('/members');
    } catch (err) {
        res.status(500).send("Error deleting member");
    }
});

router.post('/members/pay/:id', auth, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id).populate('plan');
        
        // Calculate Expiry: Today + Plan Duration
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + member.plan.durationInDays);

        await Member.findByIdAndUpdate(req.params.id, {
            paymentStatus: 'Paid',
            startDate: new Date(),
            expiryDate: expiry
        });

        req.flash('success_msg', `Payment recorded. Plan expires on ${expiry.toDateString()}`);
        res.redirect('/members');
    } catch (err) {
        req.flash('error_msg', 'Payment update failed');
        res.redirect('/members');
    }
});

module.exports = router;