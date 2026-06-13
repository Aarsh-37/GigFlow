import express from 'express';
import multer from 'multer';
import {
    getWorkspaceList,
    getWorkspaceDetail,
    createTask,
    updateTask,
    uploadFile,
    getFiles,
    submitDeliverable,
    getDeliverables,
    reviewDeliverable,
    getActivities
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Use memory storage so we handle saving manually in the controller
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Workspace List & Detail ──────────────────────────────────────────────────
router.get('/', protect, getWorkspaceList);
router.get('/:gigId', protect, getWorkspaceDetail);

// ── Tasks ────────────────────────────────────────────────────────────────────
router.post('/:gigId/tasks', protect, createTask);
router.patch('/tasks/:taskId', protect, updateTask);

// ── Files ────────────────────────────────────────────────────────────────────
router.post('/:gigId/files', protect, upload.single('file'), uploadFile);
router.get('/:gigId/files', protect, getFiles);

// ── Deliverables ─────────────────────────────────────────────────────────────
router.post('/:gigId/deliverables', protect, submitDeliverable);
router.get('/:gigId/deliverables', protect, getDeliverables);
router.patch('/deliverables/:deliverableId/:action', protect, reviewDeliverable);

// ── Activity ─────────────────────────────────────────────────────────────────
router.get('/:gigId/activities', protect, getActivities);

export default router;
