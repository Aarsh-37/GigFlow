import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'resolved', 'dismissed'],
        default: 'pending'
    },
    evidence: [{
        type: String // URLs to images/files
    }],
    resolution: {
        type: String,
        trim: true
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

disputeSchema.index({ gigId: 1 });
disputeSchema.index({ status: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;
