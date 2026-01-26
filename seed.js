const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Clear existing admins to avoid duplicates during testing
        await Admin.deleteMany({}); 

        const admin = new Admin({
            username: 'admin',
            password: '123456' // This will be hashed automatically by our Model
        });

        await admin.save();
        console.log("✅ Admin Created: admin / 123456");
        process.exit();
    })
    .catch(err => console.log(err));