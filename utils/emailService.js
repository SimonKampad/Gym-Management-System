const nodemailer = require('nodemailer');

// 1. Create the transporter once at the top level
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add these timeout settings to prevent the 'ETIMEDOUT' error
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ Mail Server Error:", error);
    } else {
        console.log("✅ Mail Server is ready");
    }
});

// 2. Function for Expiry Warnings
const sendExpiryWarning = async (memberEmail, memberName, daysLeft) => {
    const mailOptions = {
        from: `"GymMaster Pro" <${process.env.EMAIL_USER}>`,
        to: memberEmail,
        subject: 'Gym Membership Expiring Soon! 🏋️',
        html: `<h1>Hello ${memberName},</h1>
               <p>Your gym plan is expiring in <b>${daysLeft} days</b>. 
               Please visit the gym desk to renew and keep grinding!</p>`
    };
    return transporter.sendMail(mailOptions);
};

// 3. Function for General Announcements
const sendGeneralNotice = async (toEmail, userName, title, message) => {
    const mailOptions = {
        from: `"GymMaster Pro" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `📢 Gym Announcement: ${title}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #EF4444;">Hello ${userName},</h2>
                <p style="font-size: 16px; color: #333;">${message}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">Best Regards,<br><strong>GymMaster Management</strong></p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

// 4. Export both functions clearly
module.exports = { 
    sendExpiryWarning, 
    sendGeneralNotice 
};