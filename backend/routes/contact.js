const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/contact
// @desc    Receive contact form submission
router.post('/', async (req, res) => {
    try {
        const { email, message } = req.body;
        
        if (!email || !message) {
            return res.status(400).json({ msg: 'Please provide both email and message' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to HR admin
            replyTo: email,
            subject: `New Contact Form Submission from ${email}`,
            text: `You have received a new message from the HR Platform Contact Form:\n\nFrom: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6e59c5;">New Contact Form Message</h2>
                    <p><strong>From:</strong> ${email}</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="white-space: pre-wrap; margin: 0;">${message}</p>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('[EMAIL ERROR] Failed to send contact message:', error);
                return res.status(500).json({ msg: 'Failed to send message.' });
            } else {
                console.log('[EMAIL SUCCESS] Contact message sent from:', email);
                return res.status(200).json({ msg: 'Message sent successfully!' });
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
