const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: Date, default: Date.now },
    checkInTime: { type: String, default: () => new Date().toLocaleTimeString() }
});

module.exports = mongoose.model('Attendance', attendanceSchema);