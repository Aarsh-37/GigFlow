import mongoose from 'mongoose';

const workspaceFileSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String // mime type, e.g. 'application/pdf', 'image/png'
    },
    fileSize: {
        type: Number // bytes
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

workspaceFileSchema.index({ gigId: 1, createdAt: -1 });

const WorkspaceFile = mongoose.model('WorkspaceFile', workspaceFileSchema);

export default WorkspaceFile;
