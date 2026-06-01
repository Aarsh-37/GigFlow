import express from 'express';
import { 
    applyForGig, 
    updateStatus,
    getGigApplications,
    getMyApplications
} from '../controllers/applicationController.js';
import { protect, authorizeRoles } from '../../shared/middleware/authMiddleware.js';
import { validate } from '../../shared/middleware/validationMiddleware.js';
import { 
    createApplicationSchema, 
    updateApplicationStatusSchema 
} from '../../shared/validations/applicationSchema.js';
import { upload, validateFileType } from '../../shared/middleware/uploadMiddleware.js';

const router = express.Router();

// Interns apply for gigs
router.post('/', 
    protect, 
    authorizeRoles('intern', 'admin'), 
    upload.single('resumeFile'),
    validateFileType(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    validate(createApplicationSchema), 
    applyForGig
);

// Get current intern's applications
router.get('/my-applications',
    protect,
    authorizeRoles('intern', 'admin'),
    getMyApplications
);

// Get applications for a specific gig (Hirer only)
router.get('/gig/:gigId',
    protect,
    authorizeRoles('hirer'),
    getGigApplications
);

// Hirers update application status
router.patch('/:id/status', 
    protect, 
    authorizeRoles('hirer'), 
    validate(updateApplicationStatusSchema), 
    updateStatus
);

export default router;
