import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Gig from '../models/Gig.js';
import Task from '../models/Task.js';
import WorkspaceFile from '../models/WorkspaceFile.js';
import Deliverable from '../models/Deliverable.js';
import Activity from '../models/Activity.js';
import sendResponse from '../utils/sendResponse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Checks if the requesting user has access to this gig's workspace.
 * Returns the populated gig or throws.
 */
async function getAccessibleGig(gigId, userId, userRole) {
    const gig = await Gig.findById(gigId)
        .populate('ownerId', 'name email avatar')
        .populate('hiredInternId', 'name email avatar');

    if (!gig || !gig.workspaceEnabled) {
        const err = new Error('Workspace not found');
        err.statusCode = 404;
        throw err;
    }

    const isOwner = gig.ownerId._id.toString() === userId.toString();
    const isHiredIntern = gig.hiredInternId && gig.hiredInternId._id.toString() === userId.toString();
    const isTeamMember = Array.isArray(gig.teamMembers) &&
        gig.teamMembers.some(id => id.toString() === userId.toString());

    if (!isOwner && !isHiredIntern && !isTeamMember && userRole !== 'admin') {
        const err = new Error('Not authorized to access this workspace');
        err.statusCode = 403;
        throw err;
    }

    return gig;
}

/** Log an activity entry */
async function logActivity(gigId, userId, action, meta = {}) {
    try {
        await Activity.create({ gigId, userId, action, meta });
    } catch (e) {
        // Non-fatal — don't fail the whole request if activity logging fails
        console.error('Activity log error:', e.message);
    }
}

// ─── Workspace List ──────────────────────────────────────────────────────────

/**
 * @desc    Get all workspaces for the current user
 * @route   GET /api/v1/workspaces
 * @access  Private
 */
export const getWorkspaceList = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const isHirer = req.user.role === 'hirer' || req.user.role === 'admin';

    let query;
    if (isHirer) {
        query = { ownerId: userId, workspaceEnabled: true };
    } else {
        // Intern: show gigs where they are hiredInternId or in teamMembers
        query = {
            workspaceEnabled: true,
            $or: [
                { hiredInternId: userId },
                { teamMembers: userId }
            ]
        };
    }

    const gigs = await Gig.find(query)
        .select('title status deadline ownerId hiredInternId workspaceEnabled createdAt')
        .populate('ownerId', 'name avatar')
        .populate('hiredInternId', 'name avatar')
        .sort({ updatedAt: -1 });

    sendResponse(res, 200, true, 'Workspaces fetched successfully', gigs);
});

// ─── Workspace Detail ────────────────────────────────────────────────────────

/**
 * @desc    Get workspace detail (gig info, tasks, team)
 * @route   GET /api/v1/workspaces/:gigId
 * @access  Private (hirer or hired intern)
 */
export const getWorkspaceDetail = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const gig = await getAccessibleGig(gigId, req.user._id, req.user.role);

    const tasks = await Task.find({ gigId })
        .populate('createdBy', 'name avatar')
        .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Workspace detail fetched', { gig, tasks });
});

// ─── Tasks ───────────────────────────────────────────────────────────────────

/**
 * @desc    Create a task (Hirer only)
 * @route   POST /api/v1/workspaces/:gigId/tasks
 * @access  Private/Hirer
 */
export const createTask = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const { title, description, deadline } = req.body;

    await getAccessibleGig(gigId, req.user._id, req.user.role);

    if (req.user.role !== 'hirer' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only the hirer can create tasks');
    }

    const task = await Task.create({
        gigId,
        createdBy: req.user._id,
        title,
        description,
        deadline
    });

    await logActivity(gigId, req.user._id, 'task_created', { taskTitle: title });

    // Real-time update
    if (req.io) req.io.to(gigId).emit('task_updated', { type: 'created', task });

    sendResponse(res, 201, true, 'Task created', task);
});

/**
 * @desc    Update task status
 *          Intern: todo → in_review (submit)
 *          Hirer:  in_review → done | rejected
 *          Either: done task can be closed (status stays done)
 * @route   PATCH /api/v1/workspaces/tasks/:taskId
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status, title, description, deadline } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    await getAccessibleGig(task.gigId, req.user._id, req.user.role);

    const isHirer = req.user.role === 'hirer' || req.user.role === 'admin';

    if (status) {
        const validTransitions = {
            hirer: { in_review: ['done', 'rejected'] },
            intern: { todo: ['in_review'] }
        };

        const role = isHirer ? 'hirer' : 'intern';
        const allowed = validTransitions[role]?.[task.status] || [];

        if (!allowed.includes(status)) {
            res.status(400);
            throw new Error(`Cannot move task from "${task.status}" to "${status}" as ${role}`);
        }

        task.status = status;
        await logActivity(task.gigId, req.user._id, 'task_updated', {
            taskTitle: task.title,
            newStatus: status
        });
    }

    // Hirer can also edit task details
    if (isHirer) {
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (deadline) task.deadline = deadline;
    }

    await task.save();

    if (req.io) req.io.to(task.gigId.toString()).emit('task_updated', { type: 'updated', task });

    sendResponse(res, 200, true, 'Task updated', task);
});

// ─── Files ───────────────────────────────────────────────────────────────────

/**
 * @desc    Upload a file to the workspace
 * @route   POST /api/v1/workspaces/:gigId/files
 * @access  Private (hirer or intern)
 */
export const uploadFile = asyncHandler(async (req, res) => {
    const { gigId } = req.params;

    await getAccessibleGig(gigId, req.user._id, req.user.role);

    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    // Save locally
    const uniqueName = `ws-${Date.now()}-${Math.round(Math.random() * 1e5)}${path.extname(req.file.originalname)}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    fs.writeFileSync(filePath, req.file.buffer);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${uniqueName}`;

    const workspaceFile = await WorkspaceFile.create({
        gigId,
        uploadedBy: req.user._id,
        fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
    });

    await logActivity(gigId, req.user._id, 'file_uploaded', { fileName: req.file.originalname });

    if (req.io) req.io.to(gigId).emit('file_uploaded', { file: workspaceFile });

    sendResponse(res, 201, true, 'File uploaded', workspaceFile);
});

/**
 * @desc    Get all files in a workspace
 * @route   GET /api/v1/workspaces/:gigId/files
 * @access  Private
 */
export const getFiles = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    await getAccessibleGig(gigId, req.user._id, req.user.role);

    const files = await WorkspaceFile.find({ gigId })
        .populate('uploadedBy', 'name avatar')
        .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Files fetched', files);
});

// ─── Deliverables ────────────────────────────────────────────────────────────

/**
 * @desc    Submit a deliverable (Intern only)
 * @route   POST /api/v1/workspaces/:gigId/deliverables
 * @access  Private/Intern
 */
export const submitDeliverable = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const { fileId, taskId, note } = req.body;

    await getAccessibleGig(gigId, req.user._id, req.user.role);

    if (req.user.role !== 'intern' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only interns can submit deliverables');
    }

    // Verify the file belongs to this workspace
    const file = await WorkspaceFile.findOne({ _id: fileId, gigId });
    if (!file) {
        res.status(404);
        throw new Error('File not found in this workspace');
    }

    const deliverable = await Deliverable.create({
        gigId,
        taskId: taskId || undefined,
        submittedBy: req.user._id,
        fileId,
        note
    });

    // If linked to a task, move task to in_review
    if (taskId) {
        await Task.findByIdAndUpdate(taskId, { status: 'in_review' });
    }

    await logActivity(gigId, req.user._id, 'deliverable_submitted', { fileName: file.fileName });

    if (req.io) req.io.to(gigId).emit('deliverable_submitted', { deliverable });

    sendResponse(res, 201, true, 'Deliverable submitted', deliverable);
});

/**
 * @desc    Get all deliverables for a workspace
 * @route   GET /api/v1/workspaces/:gigId/deliverables
 * @access  Private
 */
export const getDeliverables = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    await getAccessibleGig(gigId, req.user._id, req.user.role);

    const deliverables = await Deliverable.find({ gigId })
        .populate('submittedBy', 'name avatar')
        .populate('reviewedBy', 'name avatar')
        .populate('fileId')
        .populate('taskId', 'title status')
        .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Deliverables fetched', deliverables);
});

/**
 * @desc    Review a deliverable (Hirer only) — approve or reject
 * @route   PATCH /api/v1/workspaces/deliverables/:deliverableId/:action
 * @access  Private/Hirer
 */
export const reviewDeliverable = asyncHandler(async (req, res) => {
    const { deliverableId, action } = req.params;
    const { remarks } = req.body;

    if (!['approve', 'reject'].includes(action)) {
        res.status(400);
        throw new Error('Invalid action. Use "approve" or "reject"');
    }

    const deliverable = await Deliverable.findById(deliverableId).populate('fileId');
    if (!deliverable) {
        res.status(404);
        throw new Error('Deliverable not found');
    }

    await getAccessibleGig(deliverable.gigId, req.user._id, req.user.role);

    if (req.user.role !== 'hirer' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only the hirer can review deliverables');
    }

    deliverable.status = action === 'approve' ? 'approved' : 'rejected';
    deliverable.reviewedBy = req.user._id;
    deliverable.remarks = remarks || '';
    deliverable.reviewedAt = new Date();
    await deliverable.save();

    // If approved and linked to task, mark task done
    if (action === 'approve' && deliverable.taskId) {
        await Task.findByIdAndUpdate(deliverable.taskId, { status: 'done' });
    }

    // If rejected and linked to task, revert task to todo
    if (action === 'reject' && deliverable.taskId) {
        await Task.findByIdAndUpdate(deliverable.taskId, { status: 'todo' });
    }

    const activityAction = action === 'approve' ? 'deliverable_approved' : 'deliverable_rejected';
    await logActivity(deliverable.gigId, req.user._id, activityAction, {
        fileName: deliverable.fileId?.fileName,
        remarks
    });

    if (req.io) {
        req.io.to(deliverable.gigId.toString()).emit('deliverable_reviewed', { deliverable, action });
    }

    sendResponse(res, 200, true, `Deliverable ${deliverable.status}`, deliverable);
});

// ─── Activity ────────────────────────────────────────────────────────────────

/**
 * @desc    Get activity timeline for a workspace
 * @route   GET /api/v1/workspaces/:gigId/activities
 * @access  Private
 */
export const getActivities = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    await getAccessibleGig(gigId, req.user._id, req.user.role);

    const activities = await Activity.find({ gigId })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(50);

    sendResponse(res, 200, true, 'Activities fetched', activities);
});
