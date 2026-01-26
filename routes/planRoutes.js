const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../middleware/authMiddleware');

// GET: View all membership plans
router.get('/plans', auth, async (req, res) => {
    const plans = await Plan.find();
    res.render('plans/index', { plans });
});

// POST: Add new plan (e.g., "Monthly Gold - $50")
router.post('/plans/add', auth, async (req, res) => {
    try {
        const { planName, price, durationInDays } = req.body;
        
        const newPlan = new Plan({
            planName,
            price,
            durationInDays
        });

        await newPlan.save();
        req.flash('success_msg', 'New plan created successfully!');
        res.redirect('/plans');
    } catch (err) {
        req.flash('error_msg', 'Failed to create plan: ' + err.message);
        res.redirect('/plans');
    }
});

module.exports = router;