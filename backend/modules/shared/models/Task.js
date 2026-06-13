import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    deadline: {
        type: Date,
        required: true
    },
    // Flow: todo → in_review (intern submits) → done (hirer approves) | rejected (hirer rejects, intern can resubmit)
    status: {
        type: String,
        enum: ['todo', 'in_review', 'done', 'rejected'],
        default: 'todo'
    }
}, {
    timestamps: true
});

taskSchema.index({ gigId: 1, status: 1 });
taskSchema.index({ deadline: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
