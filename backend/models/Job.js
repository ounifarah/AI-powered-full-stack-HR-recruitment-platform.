const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERNSHIP'],
        default: 'FULL-TIME'
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Ouvert', 'Fermé', 'En révision', 'Open', 'Closed', 'Under Review'],
        default: 'Open'
    },
    description: {
        type: String,
        default: ''
    },
    salary: {
        type: String,
        default: ''
    },
    requiredSkills: [{
        type: String
    }],
    requirements: {
        type: String,
        default: ''
    },
    candidatesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);
