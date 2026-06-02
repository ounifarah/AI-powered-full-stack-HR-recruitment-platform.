const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueType: {
        type: String,
        required: true,
        enum: ['harassment', 'discrimination', 'interpersonal', 'policy', 'other']
    },
    partiesInvolved: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low' // Standard default if missing in diagram
    },
    resolution: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Report', reportSchema);
