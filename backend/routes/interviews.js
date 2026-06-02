const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const fs = require('fs');
const path = require('path');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { extractCvText, getCvAbsolutePath } = require('../utils/cvTextExtractor');

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5:7b-instruct';
const OLLAMA_SCORING_MODEL = process.env.OLLAMA_SCORING_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5:14b-instruct';

function stripCodeFences(text = '') {
    return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function toSafeStringArray(value, maxItems = 5) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .slice(0, maxItems);
}

function toScore20(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    if (num < 0) return 0;
    if (num > 20) return 20;
    return Math.round(num);
}

function parseInterviewEvaluation(raw) {
    const parsed = JSON.parse(stripCodeFences(raw));
    const summary = typeof parsed?.summary === 'string' ? parsed.summary.trim() : '';
    const breakdown = {
        technicalSkills: toScore20(parsed?.breakdown?.technicalSkills),
        communication: toScore20(parsed?.breakdown?.communication),
        problemSolving: toScore20(parsed?.breakdown?.problemSolving),
        roleFit: toScore20(parsed?.breakdown?.roleFit),
        confidence: toScore20(parsed?.breakdown?.confidence)
    };
    const computedScore = breakdown.technicalSkills + breakdown.communication + breakdown.problemSolving + breakdown.roleFit + breakdown.confidence;
    const rawScore = Number(parsed?.score);
    const score = Number.isFinite(rawScore) ? rawScore : computedScore;
    const strengths = toSafeStringArray(parsed?.strengths, 6);
    const improvements = toSafeStringArray(parsed?.improvements, 6);
    const evidence = toSafeStringArray(parsed?.evidence, 6);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new Error('AI returned an invalid interview score.');
    }
    if (!summary) {
        throw new Error('AI returned an empty interview summary.');
    }

    return {
        score: Math.round(score),
        summary,
        breakdown,
        strengths,
        improvements,
        evidence
    };
}
// @desc    Get all interviews
router.get('/', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate('candidateId', 'firstName lastName email')
            .populate('jobId', 'title')
            .populate('conductedBy', 'firstName lastName')
            .sort({ scheduledDate: -1 });
        res.json(interviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/interviews
// @desc    Create a new interview
router.post('/', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const interviewData = req.body;

        // Auto-generate meeting link if it's an Online interview
        if (interviewData.type === 'Online') {
            const randomString = Math.random().toString(36).substring(2, 10);
            interviewData.meetingLink = `https://meet.jit.si/HRPlatform-${randomString}`;
        }

        const newInterview = new Interview(interviewData);
        const savedInterview = await newInterview.save();

        // Populate before returning so frontend has the data immediately
        await savedInterview.populate('candidateId', 'firstName lastName email');
        await savedInterview.populate('jobId', 'title');
        await savedInterview.populate('conductedBy', 'firstName lastName');

        // Send Email invitation to the candidate
        if (savedInterview.candidateId && savedInterview.candidateId.email) {
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: savedInterview.candidateId.email,
                    subject: `Interview Scheduled: ${savedInterview.jobId?.title || 'Open Position'}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.5;">
                            <h2>Interview Invitation</h2>
                            <p>Dear <strong>${savedInterview.candidateId.firstName} ${savedInterview.candidateId.lastName}</strong>,</p>
                            <p>We are pleased to invite you to an interview for the <strong>${savedInterview.jobId?.title || 'open'}</strong> position.</p>
                            <p><strong>Details:</strong></p>
                            <ul>
                                <li><strong>Date & Time:</strong> ${new Date(savedInterview.scheduledDate).toLocaleString()}</li>
                                <li><strong>Format:</strong> ${savedInterview.type}</li>
                            </ul>
                            ${savedInterview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${savedInterview.meetingLink}" target="_blank" style="color: #8b5cf6; font-weight: bold;">Join Video Call</a></p>` : ''}
                            ${savedInterview.notes ? `<p><strong>Additional Notes:</strong><br/>${savedInterview.notes}</p>` : ''}
                            <br/>
                            <p>Best regards,<br/>The HR Team</p>
                        </div>
                    `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.error('Error sending interview email:', error);
                    else console.log('Interview Email sent:', info.response);
                });
            } catch (emailErr) {
                console.error("Transporter setup failed:", emailErr);
            }
        }

        res.status(201).json(savedInterview);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/interviews/:id
// @desc    Update an interview
router.put('/:id', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('candidateId', 'firstName lastName email')
            .populate('jobId', 'title')
            .populate('conductedBy', 'firstName lastName');

        if (!interview) return res.status(404).json({ msg: 'Interview not found' });

        if (interview.candidateId && interview.candidateId.email) {
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: interview.candidateId.email,
                    subject: `Interview Updated: ${interview.jobId?.title || 'Open Position'}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.5;">
                            <h2>Interview Update</h2>
                            <p>Dear <strong>${interview.candidateId.firstName} ${interview.candidateId.lastName}</strong>,</p>
                            <p>Your interview details have been updated for the <strong>${interview.jobId?.title || 'open'}</strong> position.</p>
                            <p><strong>Updated Details:</strong></p>
                            <ul>
                                <li><strong>Date & Time:</strong> ${new Date(interview.scheduledDate).toLocaleString()}</li>
                                <li><strong>Format:</strong> ${interview.type}</li>
                                <li><strong>Status:</strong> ${interview.status}</li>
                            </ul>
                            ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}" target="_blank">Join Video Call</a></p>` : ''}
                            ${interview.notes ? `<p><strong>Notes:</strong><br/>${interview.notes}</p>` : ''}
                            <br/>
                            <p>Best regards,<br/>The HR Team</p>
                        </div>
                    `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.error('Error sending interview update email:', error);
                    else console.log('Interview update email sent:', info.response);
                });
            } catch (emailErr) {
                console.error('Transporter setup failed for interview update:', emailErr);
            }
        }

        res.json(interview);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/interviews/:id
// @desc    Delete an interview
router.delete('/:id', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const interview = await Interview.findByIdAndDelete(req.params.id);
        if (!interview) return res.status(404).json({ msg: 'Interview not found' });
        res.json({ msg: 'Interview deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/interviews/:id/chat
// @desc    Chat with Gemini for interview questions
router.post('/:id/chat', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ msg: 'Message is required.' });
        }
        if (message.length > 2000) {
            return res.status(400).json({ msg: 'Message is too long. Please keep it under 2000 characters.' });
        }

        const interview = await Interview.findById(req.params.id)
            .populate('candidateId')
            .populate('jobId');

        if (!interview) return res.status(404).json({ msg: 'Interview not found' });

        // Add human message to chat history
        interview.chatHistory.push({ role: 'user', content: message });

        let cvText = '';
        if (interview.candidateId && interview.candidateId.cvPath) {
            const cvPathOnDisk = getCvAbsolutePath(interview.candidateId.cvPath);
            if (fs.existsSync(cvPathOnDisk)) {
                cvText = await extractCvText(interview.candidateId.cvPath);
            }
        }

        const jobDescription = interview.jobId?.description || '';
        const requiredSkills = interview.jobId?.requiredSkills ? interview.jobId.requiredSkills.join(', ') : '';

        // Format history
        const formattedHistory = interview.chatHistory.map(entry => `${entry.role === 'user' ? 'HR/Candidate' : 'AI'}: ${entry.content}`).join('\\n');

        const prompt = `You are an expert HR AI Advisor. You are currently assisting an HR Manager who is conducting a live interview with a candidate.
You are talking DIRECTLY to the HR Manager. DO NOT address the candidate ("you"). 
Your goal is to guide the HR Manager by analyzing the ongoing conversation (Chat History) and suggesting the next 1-2 powerful, insightful interview questions they should ask the candidate. You may also provide a brief, professional insight on the candidate's last answer.

Job Offer: ${interview.jobId?.title || ''}
Description: ${jobDescription}
Skills needed: ${requiredSkills}

Candidate CV Extract:
${cvText.substring(0, 5000)}

Chat History (Between HR Manager/Candidate/System):
${formattedHistory}

Your Response (speak strictly to the HR Manager, e.g. "I suggest you ask..."):`;

        const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_CHAT_MODEL,
                prompt: prompt,
                stream: false
            })
        });

        if (!ollamaRes.ok) throw new Error("Failed to reach local Ollama");
        const data = await ollamaRes.json();
        const aiMessage = (data.response || '').trim();
        if (!aiMessage) {
            throw new Error('AI returned an empty response for interview guidance.');
        }
        interview.chatHistory.push({ role: 'assistant', content: aiMessage });

        await interview.save();

        res.json({ aiMessage, chatHistory: interview.chatHistory });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/interviews/:id/evaluate
// @desc    Generate final evaluation 
router.post('/:id/evaluate', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('candidateId')
            .populate('jobId');

        if (!interview) return res.status(404).json({ msg: 'Interview not found' });

        const userEntries = interview.chatHistory.filter(
            (entry) => entry.role === 'user' && typeof entry.content === 'string' && entry.content.trim()
        );
        const totalUserChars = userEntries.reduce((sum, entry) => sum + entry.content.trim().length, 0);
        if (userEntries.length < 3 || totalUserChars < 120) {
            return res.status(400).json({
                msg: 'Not enough interview data to evaluate. Add at least 3 meaningful candidate/HR notes first.'
            });
        }

                const responseTranscript = userEntries
                        .map((entry, index) => `Response ${index + 1}: ${entry.content.trim()}`)
                        .join('\\n');

                const prompt = `You are an AI Interview Evaluator.
Your job is to evaluate the candidate STRICTLY based on the candidate/HR response notes below.
Do not use your own assumptions. If evidence is weak, score lower.

Return ONLY a valid JSON object strictly matching this schema (no markdown, no extra text):
{
    "score": number (0-100),
    "summary": string,
    "breakdown": {
        "technicalSkills": number (0-20),
        "communication": number (0-20),
        "problemSolving": number (0-20),
        "roleFit": number (0-20),
        "confidence": number (0-20)
    },
    "strengths": [string],
    "improvements": [string],
    "evidence": [string]
}

Rules:
- Score must be coherent with breakdown (sum of 5 criteria).
- Keep evidence short quotes/paraphrases from the provided responses only.
- If a skill is not demonstrated in responses, do not reward it.

Interview Context:
Candidate: ${interview.candidateId?.firstName || ''} ${interview.candidateId?.lastName || ''}
Job: ${interview.jobId?.title || ''}

Candidate/HR Response Notes:
${responseTranscript}`;

        const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_SCORING_MODEL,
                prompt: prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!ollamaRes.ok) throw new Error("Failed to reach local Ollama");
        const data = await ollamaRes.json();
        const aiAnalysis = parseInterviewEvaluation(data.response || '');

        interview.aiInterviewScore = aiAnalysis.score;
        interview.aiSummary = aiAnalysis.summary;
        interview.aiBreakdown = aiAnalysis.breakdown;
        interview.aiStrengths = aiAnalysis.strengths;
        interview.aiImprovements = aiAnalysis.improvements;
        interview.aiEvidence = aiAnalysis.evidence;
        // Optionally mark it as Done
        interview.status = 'Done';

        await interview.save();

        res.json({
            score: aiAnalysis.score,
            summary: aiAnalysis.summary,
            breakdown: aiAnalysis.breakdown,
            strengths: aiAnalysis.strengths,
            improvements: aiAnalysis.improvements,
            evidence: aiAnalysis.evidence
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
