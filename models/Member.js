const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    plan: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Plan' // This connects the member to a specific Plan
    },
    startDate: { type: Date, default: Date.now }, // Calendar selection
    expiryDate: { type: Date } // We will calculate this automatically
    
});

module.exports = mongoose.model('Member', memberSchema);