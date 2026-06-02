const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Optional because if they somehow only use face login, they might not have a password... 
        // But usually it's required. Let's make it required for now.
        required: true
    },
    role: {
        type: String,
        enum: ['HR Manager', 'Employee'],
        default: 'Employee'
    },
    department: {
        type: String,
        default: 'General'
    },
    position: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
