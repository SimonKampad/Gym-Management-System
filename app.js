// 1. Core Modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Loads variables from .env file for security
const cookieParser = require('cookie-parser');
const path = require('path');
const auth = require('./middleware/authMiddleware');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const Plan = require('./models/Plan');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/memberRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const planRoutes = require('./routes/planRoutes');
const session = require('express-session');
const flash = require('connect-flash');
const cron = require('node-cron');
const sendExpiryWarning = require('./utils/emailService');

// 2. Configuration

const app = express();

// 3. View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Middlewares
app.use(express.json()); // Allows the server to handle JSON data from the frontend
app.use(express.urlencoded({ extended: true })); // Allows handling of Form data
app.use(cookieParser()); // Allows the server to read JWT tokens stored in cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serves our CSS/Images

app.use(session({
    secret: 'gym_session_secret',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Global variables for messages (available in all EJS files)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

app.use('/', authRoutes); // This mounts /login and /logout
app.use(memberRoutes);
app.use(trainerRoutes);
app.use(planRoutes);

cron.schedule('0 0 * * *', async () => {
    try {
        console.log("Checking for memberships expiring in 2 days...");
        
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        // Define start and end of that specific target day
        const startOfTargetDay = new Date(twoDaysFromNow.setHours(0, 0, 0, 0));
        const endOfTargetDay = new Date(twoDaysFromNow.setHours(23, 59, 59, 999));

        // 1. Fetch the members (This defines the variable)
        const expiringMembers = await Member.find({
            expiryDate: {
                $gte: startOfTargetDay,
                $lt: endOfTargetDay
            }
        });

        // 2. Check if we found anyone
        if (expiringMembers.length === 0) {
            console.log("No members expiring in 2 days.");
            return;
        }

        // 3. Loop and send emails
        expiringMembers.forEach(async (member) => {
            try {
                await sendExpiryWarning(member.email, member.name, 2);
                console.log(`✅ Expiry email sent to: ${member.email}`);
            } catch (mailErr) {
                console.error(`❌ Failed to send email to ${member.email}:`, mailErr.message);
            }
        });

    } catch (dbError) {
        console.error("Database error in Cron:", dbError.message);
    }
});



// 5. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected for Gym System"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// 6. Basic Route for Testing
app.get('/', (req, res) => {
    res.render('index'); // We will create this file next
});

app.get('/dashboard', auth, async (req, res) => {
    try {
        // Run all queries in parallel for speed
        const [memberCount, trainerCount, planCount, members] = await Promise.all([
            Member.countDocuments(),
            Trainer.countDocuments(),
            Plan.countDocuments(),
            Member.find().sort({ startDate: -1 }).limit(5) // Get 5 most recent members
        ]);

        // Calculate potential revenue (Sum of all member's plan prices)
        const allMembers = await Member.find().populate('plan');
        const totalRevenue = allMembers.reduce((acc, curr) => {
            return acc + (curr.plan ? curr.plan.price : 0);
        }, 0);

        res.render('dashboard', { 
            memberCount, 
            trainerCount, 
            planCount, 
            recentMembers: members,
            totalRevenue 
        });
    } catch (err) {
        res.status(500).send("Dashboard Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));