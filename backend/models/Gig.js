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
<<<<<<< HEAD
        enum: ['open', 'assigned', 'in-progress', 'completed', 'closed'],
        default: 'open'
    },
    bidDeadline: {
        type: Date
    },
    escrowAmount: {
        type: Number,
        default: 0
=======
        enum: ['open', 'assigned'],
        default: 'open'
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
    }
}, {
    timestamps: true
});

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
