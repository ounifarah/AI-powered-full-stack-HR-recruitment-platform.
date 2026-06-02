const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    conductedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['Online', 'In-person', 'Phone'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Done', 'Cancelled'],
        default: 'Scheduled'
    },
    result: {
        type: String
    },
    notes: {
        type: String
    },
    meetingLink: {
        type: String
    },
    aiInterviewScore: {
        type: Number
    },
    aiSummary: {
        type: String
    },
    aiBreakdown: {
        type: Object,
        default: null
    },
    aiStrengths: {
        type: [String],
        default: []
    },
    aiImprovements: {
        type: [String],
        default: []
    },
    aiEvidence: {
        type: [String],
        default: []
    },
    chatHistory: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', InterviewSchema);
