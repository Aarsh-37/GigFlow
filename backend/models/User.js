import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Added trim for consistency
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true // Added lowercase for consistency
    },
    password: {
        type: String,
        // required: true, // Removed as googleId can bypass password
    },
    googleId: { // Added from remote
        type: String,
        unique: true,
        sparse: true
    },
    bio: { // Added from remote
        type: String,
        default: ''
    },
    skills: { // Added from remote
        type: [String],
        default: []
    },
    profilePic: { // Added from remote
        type: String,
        default: ''
    },
    completedGigsCount: { // Added from remote
        type: Number,
        default: 0
    },
    averageRating: { // Added from remote
        type: Number,
        default: 0
    },
    balance: { // Added from remote (for payment simulation)
        type: Number,
        default: 10000
    },
    role: { // Added from remote
        type: String,
        enum: ['client', 'freelancer', 'both', 'admin'], // Expanded roles
        default: 'both' // Default to 'both' for new users
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    // Only compare if a password exists (for google auth users, this will be false)
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
