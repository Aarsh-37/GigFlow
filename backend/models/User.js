import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
<<<<<<< HEAD
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    profilePic: {
        type: String,
        default: ''
    },
    completedGigsCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 10000 // Starting balance for simulation
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
=======
        required: true
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
    }
}, {
    timestamps: true
});

<<<<<<< HEAD
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
=======
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
