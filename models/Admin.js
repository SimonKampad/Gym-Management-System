const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
});

// "Pre-save" Hook: Automatically hashes the password before saving to DB
// Remove 'next' from the arguments
adminSchema.pre('save', async function() {
    // 'this' refers to the admin document being saved
    if (!this.isModified('password')) return; 

    // Hash the password and replace the plain text one
    this.password = await bcrypt.hash(this.password, 10);
    
    // No need to call next() when using an async function!
});

module.exports = mongoose.model('Admin', adminSchema);