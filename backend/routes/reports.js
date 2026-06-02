const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const nodemailer = require('nodemailer');

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/reports
// @desc    Submit a new report (by Employee)
router.post('/', async (req, res) => {
    try {
        const { reportedBy, issueType, partiesInvolved, description } = req.body;
        
        const newReport = new Report({
            reportedBy,
            issueType,
            partiesInvolved,
            description
        });

        const report = await newReport.save();
        res.status(201).json(report);
    } catch (err) {
        console.error('Error creating report:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/reports
// @desc    Get all reports (for HR Manager)
router.get('/', async (req, res) => {
    try {
        // Populate the reportedBy to get the employee's name and email
        const reports = await Report.find().populate('reportedBy', 'firstName lastName email department').sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error('Error fetching reports:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/reports/:id
// @desc    Update report status (by HR Manager)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ msg: 'Status is required.' });
        }
        
        let report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        report.status = status;
        await report.save();
        
        // Populate reportedBy to get email
        await report.populate('reportedBy', 'firstName lastName email department');

        let emailSent = false;
        let emailMessage = '';

        // Send email to the employee
        if (report.reportedBy && report.reportedBy.email) {
            const issueLabel = String(report.issueType || 'Reported issue')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: report.reportedBy.email,
                subject: `Update on Your HR Conflict Report - Status: ${status}`,
                text: `Dear ${report.reportedBy.firstName},\n\nThis is an official update regarding your conflict report (${issueLabel}).\n\nCurrent status: ${status}\n\nOur HR team is actively handling this matter with confidentiality and due process. If additional information is required, we will contact you directly.\n\nBest regards,\nHR Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937;">
                        <h2 style="margin: 0 0 16px 0; color: #1e3a8a;">Conflict Report Status Update</h2>
                        <p style="margin: 0 0 12px 0;">Dear <strong>${report.reportedBy.firstName} ${report.reportedBy.lastName || ''}</strong>,</p>
                        <p style="margin: 0 0 12px 0;">This is an official update regarding your submitted conflict report.</p>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 14px 0;">
                            <p style="margin: 0 0 8px 0;"><strong>Issue Type:</strong> ${issueLabel}</p>
                            <p style="margin: 0;"><strong>Current Status:</strong> ${status}</p>
                        </div>
                        <p style="margin: 0 0 12px 0;">Our HR team is handling this matter with confidentiality and due process. If additional information is needed, we will contact you directly.</p>
                        <p style="margin: 0 0 16px 0;">Thank you for your patience and cooperation.</p>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Best regards,<br/>HR Team</p>
                    </div>
                `
            };
            try {
                await transporter.sendMail(mailOptions);
                emailSent = true;
                emailMessage = `Status email sent to ${report.reportedBy.email}.`;
                console.log('[EMAIL SUCCESS] Report status update sent to:', report.reportedBy.email);
            } catch (error) {
                emailSent = false;
                emailMessage = `Status updated, but email failed for ${report.reportedBy.email}.`;
                console.error('[EMAIL ERROR] Failed to send report status update to:', report.reportedBy.email, error);
            }
        } else {
            emailMessage = 'Status updated, but reporter email was missing.';
        }

        res.json({
            report,
            emailSent,
            emailMessage
        });
    } catch (err) {
        console.error('Error updating report:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
