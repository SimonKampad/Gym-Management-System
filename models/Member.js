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
    expiryDate: { type: Date }, // We will calculate this automatically,
    // Inside your Member schema
    weightHistory: [{
    weight: Number,
    date: { type: Date, default: Date.now }
}],
// Add these to your Member Schema
height: Number, // in cm
activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'extreme'] },
dailyTargets: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
},
    password: { 
        type: String, 
        default: function() { return this.phone; } // Sets password to phone by default
    },
    role: { 
        type: String, 
        default: 'member' 
    }
    
});

module.exports = mongoose.model('Member', memberSchema);