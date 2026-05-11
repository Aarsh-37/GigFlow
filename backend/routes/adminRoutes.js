import express from 'express';
import {
    getAllUsers,
    getAllGigs,
    deleteGig,
    updateUserRole
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

router.get('/gigs', getAllGigs);
router.delete('/gigs/:id', deleteGig);

export default router;
