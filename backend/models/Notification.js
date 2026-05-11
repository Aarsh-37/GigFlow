import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['bid_placed', 'hired', 'gig_completed', 'gig_closed', 'review_received'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
