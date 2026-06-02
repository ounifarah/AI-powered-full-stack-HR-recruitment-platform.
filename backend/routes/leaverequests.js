const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const nodemailer = require('nodemailer');

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   GET /api/leaverequests
// @desc    Get all leave requests
router.get('/', async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find()
            .populate('employeeId', 'firstName lastName email department position')
            .sort({ createdAt: -1 });
        res.json(leaveRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/leaverequests
// @desc    Create a new leave request (usually by Employee)
router.post('/', async (req, res) => {
    try {
        const { employeeId, type, startDate, endDate, reason } = req.body;
        
        const newLeaveRequest = new LeaveRequest({
            employeeId,
            type,
            startDate,
            endDate,
            reason
        });

        const leaveRequest = await newLeaveRequest.save();
        await leaveRequest.populate('employeeId', 'firstName lastName email department position');
        
        res.status(201).json(leaveRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/leaverequests/:id
// @desc    Update a leave request (HR Manager approving/rejecting)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        let leaveRequest = await LeaveRequest.findById(req.params.id);
        if (!leaveRequest) return res.status(404).json({ msg: 'Leave request not found' });

        if (status) leaveRequest.status = status;

        await leaveRequest.save();
        await leaveRequest.populate('employeeId', 'firstName lastName email department position');
        
        // Send email to the employee
        if (leaveRequest.employeeId && leaveRequest.employeeId.email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: leaveRequest.employeeId.email,
                subject: `Leave Request Update: ${status}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #6e59c5;">Leave Request ${status}</h2>
                        <p>Hi ${leaveRequest.employeeId.firstName},</p>
                        <p>Your leave request for <strong>${leaveRequest.type}</strong> from <strong>${new Date(leaveRequest.startDate).toLocaleDateString()}</strong> to <strong>${new Date(leaveRequest.endDate).toLocaleDateString()}</strong> has been <strong>${status}</strong> by HR.</p>
                        <br/>
                        <p style="color: #666; font-size: 14px;">Best regards,<br/>Your HR Team</p>
                    </div>
                `
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('[EMAIL ERROR] Failed to send leave request update to:', leaveRequest.employeeId.email, error);
                } else {
                    console.log('[EMAIL SUCCESS] Leave request update sent to:', leaveRequest.employeeId.email);
                }
            });
        }

        res.json(leaveRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/leaverequests/:id
// @desc    Delete a leave request
router.delete('/:id', async (req, res) => {
    try {
        const leaveRequest = await LeaveRequest.findByIdAndDelete(req.params.id);
        if (!leaveRequest) return res.status(404).json({ msg: 'Leave request not found' });

        res.json({ msg: 'Leave request removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
