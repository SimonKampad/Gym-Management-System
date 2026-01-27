const nodemailer = require('nodemailer');

const sendExpiryWarning = async (memberEmail, memberName, daysLeft) => {
    // We create the transporter INSIDE the function to ensure ENV variables are loaded
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

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

module.exports = sendExpiryWarning;