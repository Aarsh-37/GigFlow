import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
        // optional link to a specific task
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkspaceFile',
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    // Approval flow: pending → approved | rejected
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    remarks: {
        type: String,
        trim: true
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

deliverableSchema.index({ gigId: 1, status: 1 });
deliverableSchema.index({ taskId: 1 });

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

export default Deliverable;
