import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true // Added trim for consistency
    },
    description: {
        type: String,
        required: true,
        trim: true // Added trim for consistency
    },
    budget: {
        type: Number,
        required: true,
        min: 1 // Ensure budget is positive
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'assigned', 'in-progress', 'completed', 'closed'],
        default: 'open'
    },
    deadline: { // Renamed from bidDeadline to match audit
        type: Date
    },
    escrowAmount: {
        type: Number,
        default: 0
    },
    // New fields from roadmap
    category: {
        type: String,
        enum: ['Design', 'Development', 'Writing', 'Marketing', 'Other'], // Example categories
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    currency: {
        type: String,
        default: 'INR',
        uppercase: true
    },
    attachments: [{
        type: String // URLs to attachments
    }],
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

gigSchema.index({ ownerId: 1 });
gigSchema.index({ status: 1 });
gigSchema.index({ category: 1 });
gigSchema.index({ tags: 1 });
gigSchema.index({ deadline: 1 });
gigSchema.index({ title: 'text', description: 'text' });

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
