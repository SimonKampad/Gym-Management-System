const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const auth = require('../middleware/authMiddleware');
const Plan = require('../models/Plan'); // Import the Plan model

// 1. GET: Show all members in a table
router.get('/members', auth, async (req, res) => {
    const members = await Member.find().populate('plan'); // THIS IS THE KEY
    const plans = await Plan.find();
    res.render('members/index', { members, plans });
});

// 2. POST: Process the 'Add Member' form
router.post('/members/add', auth, async (req, res) => {
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
router.get('/members/edit/:id', auth, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        res.render('members/edit', { member });
    } catch (err) {
        res.redirect('/members');
    }
});

// 2. POST: Update Member Data
router.post('/members/edit/:id', auth, async (req, res) => {
    try {
        const { name, email, phone, age, gender } = req.body;
        await Member.findByIdAndUpdate(req.params.id, { 
            name, email, phone, age, gender 
        });
        req.flash('success_msg', 'Member updated successfully!');
        res.redirect('/members');
    } catch (err) {
        req.flash('error_msg', 'Update failed.');
        res.redirect('/members');
    }
});

// 3. GET: Delete a member
router.get('/members/delete/:id', auth, async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.redirect('/members');
    } catch (err) {
        res.status(500).send("Error deleting member");
    }
});

module.exports = router;