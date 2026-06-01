import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: [true, 'Please add a cover letter']
    },
    resume: {
        type: String, // URL to the resume (e.g., Cloudinary)
        required: [true, 'Please provide a resume']
    },
    status: {
        type: String,
        enum: Object.values(APPLICATION_STATUS),
        default: APPLICATION_STATUS.APPLIED
    }
}, {
    timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ gigId: 1, internId: 1 }, { unique: true });
applicationSchema.index({ gigId: 1, status: 1 });
applicationSchema.index({ internId: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
