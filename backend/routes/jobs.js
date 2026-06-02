const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// @route   GET /api/jobs
// @desc    Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).lean();
        for (let job of jobs) {
            job.candidatesCount = await Candidate.countDocuments({ jobId: job._id });
        }
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/jobs
// @desc    Create a new job (HR Manager only usually, but simplified here)
router.post('/', async (req, res) => {
    try {
        const { title, type, department, location, status, description, salary, requirements } = req.body;

        const newJob = new Job({
            title,
            type,
            department,
            location,
            status: status || 'Ouvert',
            description,
            salary,
            requirements,
            candidatesCount: 0
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/jobs/:id/status
// @desc    Update job status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        let job = await Job.findById(req.params.id);
        
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        job.status = status;
        await job.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job's details
router.put('/:id', async (req, res) => {
    try {
        const { title, type, department, location, status, description, salary, requirements } = req.body;
        let job = await Job.findById(req.params.id);
        
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        if (title) job.title = title;
        if (type) job.type = type;
        if (department) job.department = department;
        if (location) job.location = location;
        if (status) job.status = status;
        if (description !== undefined) job.description = description;
        if (salary !== undefined) job.salary = salary;
        if (requirements !== undefined) job.requirements = requirements;

        await job.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        await job.remove();
        res.json({ msg: 'Job removed' });
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server error');
    }
});


module.exports = router;
