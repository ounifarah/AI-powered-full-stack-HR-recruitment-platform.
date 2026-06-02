const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { vectorizeAndStoreCV, retrieveRelevantCVChunks } = require('../utils/chromaClient');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { extractCvText, getCvAbsolutePath } = require('../utils/cvTextExtractor');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_SCORING_MODEL = process.env.OLLAMA_SCORING_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5:14b-instruct';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generatePassword = () => crypto.randomBytes(8).toString('hex');

function stripCodeFences(text = '') {
    return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function toStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeSkillText(text = '') {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getJobSkillCandidates(job = {}) {
    const skills = [];

    if (Array.isArray(job.requiredSkills)) {
        skills.push(...job.requiredSkills);
    }

    if (typeof job.requirements === 'string' && job.requirements.trim()) {
        skills.push(
            ...job.requirements
                .split(/[,;/\n]|\band\b/gi)
                .map((item) => item.trim())
                .filter(Boolean)
        );
    }

    return [...new Set(skills)];
}

function findExplicitSkillMatches(cvText = '', skillCandidates = []) {
    const normalizedCvText = normalizeSkillText(cvText);

    return skillCandidates.filter((skill) => {
        const normalizedSkill = normalizeSkillText(skill);
        return normalizedSkill && normalizedCvText.includes(normalizedSkill);
    });
}

function removeFalseMissingSkills(missingSkills = [], cvText = '') {
    const normalizedCvText = normalizeSkillText(cvText);
    return missingSkills.filter((skill) => {
        const normalizedSkill = normalizeSkillText(skill);
        return !normalizedSkill || !normalizedCvText.includes(normalizedSkill);
    });
}

function parseCandidateAiAnalysis(raw) {
    const parsed = JSON.parse(stripCodeFences(raw));
    const score = Number(parsed?.score);
    const recommendation = typeof parsed?.recommendation === 'string' ? parsed.recommendation.trim() : '';
    const matchedSkills = toStringArray(parsed?.matchedSkills);
    const missingSkills = toStringArray(parsed?.missingSkills);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new Error('AI returned an invalid candidate score.');
    }
    if (!recommendation) {
        throw new Error('AI returned an empty recommendation.');
    }

    return {
        score: Math.round(score),
        recommendation,
        matchedSkills,
        missingSkills
    };
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../uploads/cvs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const extName = path.extname(file.originalname).toLowerCase();
    if (extName === '.pdf' || extName === '.doc' || extName === '.docx') {
        return cb(null, true);
    }
    cb(new Error('Seuls les fichiers PDF et Word (.doc, .docx) sont autorisés.'));
};

const upload = multer({
    storage,
    fileFilter
});

// @route   GET /api/candidates
// @desc    Get all candidates
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('jobId', 'title').sort({ appliedDate: -1 });
        res.json(candidates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/candidates
// @desc    Create a new candidate
router.post('/', upload.single('cv'), async (req, res) => {
    try {
        const { firstName, lastName, email, jobId, extractedSkills, extractedExperience, status, aiScore } = req.body;
        const cvPath = req.file ? `/uploads/cvs/${req.file.filename}` : '';

        const candidate = await Candidate.create({
            firstName,
            lastName,
            email,
            cvPath,
            jobId,
            extractedSkills: extractedSkills || [],
            extractedExperience: extractedExperience || '',
            status: status || 'Pending',
            aiScore: aiScore || 0
        });

        autoScoreCandidate(candidate._id).catch(console.error);

        res.json(candidate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

async function autoScoreCandidate(candidateId) {
    try {
        const candidate = await Candidate.findById(candidateId).populate('jobId');
        if (!candidate || !candidate.jobId) return;

        const cvPathOnDisk = getCvAbsolutePath(candidate.cvPath);
        if (!fs.existsSync(cvPathOnDisk)) return;

        const cvText = await extractCvText(candidate.cvPath);
        const jobDescription = candidate.jobId.description || '';
        const jobRequirements = candidate.jobId.requirements || '';
        const requiredSkills = candidate.jobId.requiredSkills ? candidate.jobId.requiredSkills.join(', ') : '';
        const explicitSkillMatches = findExplicitSkillMatches(cvText, getJobSkillCandidates(candidate.jobId));

        await vectorizeAndStoreCV(candidate._id, cvText);

        const query = `Skills required: ${requiredSkills}. Job description: ${jobDescription}. Requirements: ${jobRequirements}`;
        const relevantContext = await retrieveRelevantCVChunks(candidate._id, query, 3);

        const prompt = `You are an extremely strict Technical HR Recruiter. Your task is to rigorously evaluate the candidate's CV against the job requirements.
Perform a STRICT, literal evaluation. DO NOT assume or guess skills. DO NOT hallucinate. IF A SKILL IS IN THE JOB OFFER BUT NOT IN THE CV TEXT BELOW, YOU MUST DENY IT AND PUT IT IN MISSING SKILLS.

Evaluate the CV against the Job Offer and return ONLY a valid JSON object strictly matching this schema, completely without any markdown formatting or \`\`\`json block:
{
  "score": number (0-100, be highly critical. Deduct heavily from 100 for each missing technical requirement),
  "recommendation": string (1-2 precise sentences explaining exactly why this score was given, calling out critical missing or matched elements),
  "matchedSkills": [string, string, ... (Only list exact technical skills found explicitly in the CV text. DO NOT GUESS.)],
  "missingSkills": [string, string, ... (Strictly list core job requirements that the candidate fails to demonstrate)]
}

Job Offer Info:
Title: ${candidate.jobId.title}
Requirements: ${jobRequirements}
Required Skills: ${requiredSkills}

Confirmed exact skills found in the full CV text:
${explicitSkillMatches.length > 0 ? explicitSkillMatches.join(', ') : 'None detected automatically'}

Full CV text:
${cvText.substring(0, 12000)}

Candidate Relevant CV Fragments (matched via search):
${relevantContext || 'No CV fragments retrieved (Candidate CV may be empty).'}

WARNING: Only output JSON. Check your work to ensure matchedSkills are genuinely present in the Candidate Relevant CV Fragments.`;

        const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_SCORING_MODEL,
                prompt,
                stream: false,
                format: 'json',
                options: {
                    temperature: 0.0,
                    top_p: 0.1
                }
            })
        });

        if (!ollamaRes.ok) throw new Error('Failed to reach local Ollama');
        const data = await ollamaRes.json();
        const aiAnalysis = parseCandidateAiAnalysis(data.response || '');

        const mergedMatchedSkills = [...new Set([...explicitSkillMatches, ...aiAnalysis.matchedSkills])];

        candidate.aiScore = aiAnalysis.score;
        candidate.extractedSkills = mergedMatchedSkills;
        await candidate.save();
    } catch (err) {
        console.error('Background AI evaluation failed:', err);
    }
}

// @route   PUT /api/candidates/:id
// @desc    Update candidate
router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, cvPath, jobId, extractedSkills, extractedExperience, status, aiScore } = req.body;

        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });

        if (firstName) candidate.firstName = firstName;
        if (lastName) candidate.lastName = lastName;
        if (email) candidate.email = email;
        if (cvPath) candidate.cvPath = cvPath;
        if (jobId) candidate.jobId = jobId;
        if (extractedSkills) candidate.extractedSkills = extractedSkills;
        if (extractedExperience) candidate.extractedExperience = extractedExperience;
        if (aiScore !== undefined) candidate.aiScore = aiScore;
        if (status) candidate.status = status;

        await candidate.save();
        res.json(candidate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete a candidate
router.delete('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });

        await candidate.deleteOne();
        res.json({ msg: 'Candidate removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Candidate not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/candidates/:id/score
// @desc    Score a candidate CV against job offer
router.post('/:id/score', authenticate, authorizeRoles('HR Manager'), async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('jobId');
        if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });
        if (!candidate.jobId) return res.status(400).json({ msg: 'Candidate has no associated job' });

        const cvPathOnDisk = getCvAbsolutePath(candidate.cvPath);
        if (!fs.existsSync(cvPathOnDisk)) {
            return res.status(404).json({ msg: 'CV file not found on disk' });
        }

        const cvText = await extractCvText(candidate.cvPath);
        const jobDescription = candidate.jobId.description || '';
        const jobRequirements = candidate.jobId.requirements || '';
        const requiredSkills = candidate.jobId.requiredSkills ? candidate.jobId.requiredSkills.join(', ') : '';
        const explicitSkillMatches = findExplicitSkillMatches(cvText, getJobSkillCandidates(candidate.jobId));

        await vectorizeAndStoreCV(candidate._id, cvText);

        const query = `Skills required: ${requiredSkills}. Job description: ${jobDescription}. Requirements: ${jobRequirements}`;
        const relevantContext = await retrieveRelevantCVChunks(candidate._id, query, 3);

        const prompt = `You are an extremely strict Technical HR Recruiter. Your task is to rigorously evaluate the candidate's CV against the job requirements.
Perform a STRICT, literal evaluation. DO NOT assume or guess skills. DO NOT hallucinate. IF A SKILL IS IN THE JOB OFFER BUT NOT IN THE CV TEXT BELOW, YOU MUST DENY IT AND PUT IT IN MISSING SKILLS.

Evaluate the CV against the Job Offer and return ONLY a valid JSON object strictly matching this schema, completely without any markdown formatting or \`\`\`json block:
{
  "score": number (0-100, be highly critical. Deduct heavily from 100 for each missing technical requirement),
  "recommendation": string (1-2 precise sentences explaining exactly why this score was given, calling out critical missing or matched elements),
  "matchedSkills": [string, string, ... (Only list exact technical skills found explicitly in the CV text. DO NOT GUESS.)],
  "missingSkills": [string, string, ... (Strictly list core job requirements that the candidate fails to demonstrate)]
}

Job Offer Info:
Title: ${candidate.jobId.title}
Requirements: ${jobRequirements}
Required Skills: ${requiredSkills}

Confirmed exact skills found in the full CV text:
${explicitSkillMatches.length > 0 ? explicitSkillMatches.join(', ') : 'None detected automatically'}

Full CV text:
${cvText.substring(0, 12000)}

Candidate Relevant CV Fragments (matched via search):
${relevantContext || 'No CV fragments retrieved (Candidate CV may be empty).'}

WARNING: Only output JSON. Check your work to ensure matchedSkills are genuinely present in the Candidate Relevant CV Fragments.`;

        const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_SCORING_MODEL,
                prompt,
                stream: false,
                format: 'json',
                options: {
                    temperature: 0.0,
                    top_p: 0.1
                }
            })
        });

        if (!ollamaRes.ok) throw new Error('Failed to reach local Ollama');
        const data = await ollamaRes.json();
        const aiAnalysis = parseCandidateAiAnalysis(data.response || '');

        const sanitizedMissingSkills = removeFalseMissingSkills(aiAnalysis.missingSkills, cvText);
        const mergedMatchedSkills = [...new Set([...explicitSkillMatches, ...aiAnalysis.matchedSkills])];

        candidate.aiScore = aiAnalysis.score;
        candidate.extractedSkills = mergedMatchedSkills;
        await candidate.save();

        res.json({
            candidate,
            analysis: {
                ...aiAnalysis,
                matchedSkills: mergedMatchedSkills,
                missingSkills: sanitizedMissingSkills
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/candidates/:id/convert-to-employee
// @desc    Convert candidate to employee account
router.post('/:id/convert-to-employee', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('jobId');
        if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });

        if (candidate.convertedToEmployee) {
            return res.status(400).json({ msg: 'Candidate already converted to employee.' });
        }

        const existingUser = await User.findOne({ email: candidate.email.toLowerCase() });
        if (existingUser) {
            candidate.convertedToEmployee = true;
            candidate.status = 'Accepted';
            await candidate.save();
            return res.status(200).json({
                msg: 'Candidate email already exists as a user. Candidate marked as converted.',
                employeeAlreadyExisted: true
            });
        }

        const temporaryPassword = generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        const employee = new User({
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email.toLowerCase(),
            password: hashedPassword,
            role: 'Employee',
            department: candidate.jobId?.department || 'General',
            avatar: ''
        });

        await employee.save();

        candidate.convertedToEmployee = true;
        candidate.status = 'Accepted';
        await candidate.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: employee.email,
            subject: 'Welcome to HR Platform - Your Employee Account',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Welcome to the Team, ${employee.firstName}!</h2>
                    <p>Your employee account has been created from your candidate application.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Login Email:</strong> ${employee.email}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</span></p>
                    </div>
                    <p>Please log in and change your password after your first access.</p>
                    <p style="color: #666; font-size: 14px;">Best regards,<br/>HR Team</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('[EMAIL ERROR] Failed to send employee credentials:', error);
            } else {
                console.log('[EMAIL SUCCESS] Employee credentials sent:', info.response);
            }
        });

        return res.status(201).json({
            msg: 'Candidate converted to employee successfully.',
            employee: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                role: employee.role,
                department: employee.department
            },
            temporaryPassword
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
