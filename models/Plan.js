const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true } // Example: 30, 90, 365
});

module.exports = mongoose.model('Plan', planSchema);