const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const lawyerProfileSchema = new mongoose.Schema({
    specialization: String,
    experience: Number,
    bio: String,
    location: String,
    hourlyRate: Number,
    rating: { type: Number, default: 0.0 },
    reviewCount: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { 
        type: String, 
        enum: ['LAWYER', 'LITIGANT', 'CLERK', 'VENDOR', 'LAW_FIRM_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
        default: 'LITIGANT'
    },
    barId: String,
    language: { type: String, default: 'en' },
    subscription: String,
    lawyerProfile: lawyerProfileSchema
}, { timestamps: true });

// Index for email lookups
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
