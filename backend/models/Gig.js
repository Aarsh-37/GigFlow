import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
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
    bidDeadline: {
        type: Date
    },
    escrowAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
