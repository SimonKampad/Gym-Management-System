const { Resend } = require('resend');

// Initialize Resend with the API Key from your Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Function for Expiry Warnings
const sendExpiryWarning = async (memberEmail, memberName, daysLeft) => {
    try {
        await resend.emails.send({
            from: 'GymMaster Pro <onboarding@resend.dev>',
            to: memberEmail,
            subject: 'Gym Membership Expiring Soon! 🏋️',
            html: `<h1>Hello ${memberName},</h1>
                   <p>Your gym plan is expiring in <b>${daysLeft} days</b>. 
                   Please visit the gym desk to renew and keep grinding!</p>`
        });
        console.log(`✅ Expiry warning sent to: ${memberEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send expiry warning to ${memberEmail}:`, error.message);
    }
};

// 2. Function for General Announcements
const sendGeneralNotice = async (toEmail, userName, title, message) => {
    try {
        const { data, error } = await resend.emails.send({
            // On the Free Tier, you MUST use 'onboarding@resend.dev' as the sender
            from: 'GymMaster Pro <onboarding@resend.dev>',
            to: [toEmail],
            subject: `📢 Gym Announcement: ${title}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #EF4444;">Hello ${userName},</h2>
                    <p style="font-size: 16px; color: #333;">${message}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">Best Regards,<br><strong>GymMaster Management</strong></p>
                </div>
            `,
        });

        if (error) throw error;
        return data;
    } catch (err) {
        console.error(`❌ Resend Error for ${toEmail}:`, err.message);
        throw err; // Throw so the router catch block can see it
    }
};

module.exports = { 
    sendExpiryWarning, 
    sendGeneralNotice 
};