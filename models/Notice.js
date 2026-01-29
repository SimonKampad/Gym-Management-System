const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['Holiday', 'Event', 'Maintenance', 'Offer'], default: 'Holiday' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);