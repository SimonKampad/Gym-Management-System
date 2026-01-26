const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');
const auth = require('../middleware/authMiddleware');

// GET: View all trainers
router.get('/trainers', auth, async (req, res) => {
    const trainers = await Trainer.find();
    res.render('trainers/index', { trainers });
});

// POST: Add new trainer
router.post('/trainers/add', auth, async (req, res) => {
    const { name, specialty, contact, salary } = req.body;
    await new Trainer({ name, specialty, contact, salary }).save();
    res.redirect('/trainers');
});

module.exports = router;