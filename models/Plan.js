const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true },
    description: { type: String, required: true } // New Field: Benefits/Details
});

module.exports = mongoose.model('Plan', planSchema);