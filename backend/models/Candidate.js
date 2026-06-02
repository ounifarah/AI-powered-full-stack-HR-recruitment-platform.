const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    cvPath: {
        type: String,
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    extractedSkills: [{
        type: String
    }],
    extractedExperience: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    aiScore: {
        type: Number,
        default: 0
    },
    convertedToEmployee: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
