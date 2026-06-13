import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Action types:
    // task_created, task_updated, task_closed
    // file_uploaded
    // deliverable_submitted, deliverable_approved, deliverable_rejected
    // message_sent
    action: {
        type: String,
        required: true
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // e.g. { taskTitle: 'Design Homepage', fileName: 'logo.png' }
    }
}, {
    timestamps: true
});

activitySchema.index({ gigId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
