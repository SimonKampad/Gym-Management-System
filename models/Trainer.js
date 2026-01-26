const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: String, // e.g., Yoga, Bodybuilding, Cardio
    contact: String,
    salary: Number
});

module.exports = mongoose.model('Trainer', trainerSchema);