const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const sendGridApiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendGridApiKey);

const sendPaymentStatusEmail = async (toEmail, status, note) => {
    const msg = {
        to: toEmail,
        from: 'zaffa1034@gmail.com', // this must be your verified sender email!
        subject: `Payment ${status}`,
        text: `Your payment has been ${status}. Note: ${note}`,
        html: `<p>Your payment has been <strong>${status}</strong>.</p><p>Note: ${note}</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendPaymentStatusEmail };
