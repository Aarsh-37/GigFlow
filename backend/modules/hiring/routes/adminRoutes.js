import express from 'express';
import {
    getAllUsers,
    getAllGigs,
    deleteGig,
    updateUserRole
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

router.get('/gigs', getAllGigs);
router.delete('/gigs/:id', deleteGig);

export default router;
