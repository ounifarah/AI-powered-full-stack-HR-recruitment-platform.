const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Assuming Gmail, but you can change it
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Utility to generate a secure random password
const generatePassword = () => {
    return crypto.randomBytes(8).toString('hex'); // 16char password
};

// @route   POST /api/auth/register
// @desc    Register a user (with or without faceDescriptor)
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Check user existence
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            department: req.body.department || 'General',
            avatar: req.body.avatar || req.body.image || '',
            image: req.body.image || req.body.avatar || ''
        });

        await user.save();

        // Return JWT
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department, phoneNumber: user.phoneNumber, avatar: user.avatar, image: user.image || user.avatar } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Login user via Email + Password
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email && password) {
            // STANDARD EMAIL/PASSWORD LOGIN
            let user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const payload = { user: { id: user.id, role: user.role } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
            return res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department, phoneNumber: user.phoneNumber, avatar: user.avatar, image: user.image || user.avatar } });
        } else {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/users
// @desc    Get all users, optionally filtered by role
router.get('/users', async (req, res) => {
    try {
        const query = {};
        if (req.query.role) {
            query.role = req.query.role;
        }
        
        // Exclude password from results
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/users/:id
// @desc    Get one user by id
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/employee
// @desc    Admin creates a new employee (Auto-generates password)
router.post('/employee', async (req, res) => {
    try {
        const { firstName, lastName, email, department, phoneNumber, joinDate } = req.body;

        // Check user existence
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const generatedPassword = generatePassword();
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create new user
        user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'Employee',
            department: department || 'General',
            phoneNumber,
            joinDate: joinDate ? new Date(joinDate) : Date.now(),
            avatar: req.body.avatar || req.body.image || '',
            image: req.body.image || req.body.avatar || ''
        });

        await user.save();

        // Actually send the email using Nodemailer
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to HR Platform - Your Employee Account',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6e59c5;">Welcome to the Team, ${firstName}! 🎉</h2>
                    <p>Your employee account on the HR Platform has been successfully created.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Your Login Email:</strong> ${email}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${generatedPassword}</span></p>
                    </div>
                    <p>You can use this password to log in. We recommend changing it once you access your dashboard.</p>
                    <br/>
                    <p style="color: #666; font-size: 14px;">Best regards,<br/>Your HR Team</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('[EMAIL ERROR] Failed to send email to:', email, error);
            } else {
                console.log('[EMAIL SUCCESS] Credentials sent to:', email, info.response);
            }
        });

        // Return the user and the raw password so the HR dashboard can display it once
        res.status(201).json({ 
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department, phoneNumber: user.phoneNumber, joinDate: user.joinDate, avatar: user.avatar, image: user.image || user.avatar },
            temporaryPassword: generatedPassword 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/auth/users/:id
// @desc    Update a user
router.put('/users/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, department, phoneNumber, joinDate, avatar, image } = req.body;
        let user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email.toLowerCase();
        if (department !== undefined) user.department = department; // Allow clearing department
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (joinDate) user.joinDate = new Date(joinDate);
        if (avatar !== undefined) {
            user.avatar = avatar;
            user.image = avatar;
        }
        if (image !== undefined) {
            user.image = image;
            user.avatar = image;
        }

        await user.save();
        res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department, phoneNumber: user.phoneNumber, joinDate: user.joinDate, avatar: user.avatar, image: user.image || user.avatar });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;
