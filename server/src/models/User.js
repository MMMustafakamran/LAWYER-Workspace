const mongoose = require('mongoose');

const lawyerProfileSchema = new mongoose.Schema({
    specialization: String,
    experience: Number,
    bio: String,
    location: String,
    hourlyRate: Number,
    rating: { type: Number, default: 0.0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    cnic: String,
    licenseNumber: String,
    // NEW: Hiring features
    isAvailableForHiring: { type: Boolean, default: true },
    availability: {
        monday: { available: { type: Boolean, default: true }, hours: String },
        tuesday: { available: { type: Boolean, default: true }, hours: String },
        wednesday: { available: { type: Boolean, default: true }, hours: String },
        thursday: { available: { type: Boolean, default: true }, hours: String },
        friday: { available: { type: Boolean, default: true }, hours: String },
        saturday: { available: { type: Boolean, default: false }, hours: String },
        sunday: { available: { type: Boolean, default: false }, hours: String }
    }
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
    subscription: {
        tier: { type: String, enum: ['FREE', 'GOLD', 'PREMIUM', 'PLATINUM'], default: 'FREE' },
        status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' },
        expiryDate: Date
    },
    lawyerProfile: lawyerProfileSchema,
    // NEW: Profile picture
    profilePicture: String
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'lawyerProfile.specialization': 1 });
userSchema.index({ 'lawyerProfile.location': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
