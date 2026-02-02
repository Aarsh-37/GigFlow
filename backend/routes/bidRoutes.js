import express from 'express';
<<<<<<< HEAD
import {
    placeBid,
    getBidsByGig,
    hireFreelancer,
    updateBid,
    withdrawBid
} from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isBidOwner } from '../middleware/checkOwnership.js';
import { validate, placeBidSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, validate(placeBidSchema), placeBid);

router.route('/:gigId')
    .get(protect, getBidsByGig);

router.route('/:bidId/hire')
    .patch(protect, hireFreelancer);

router.route('/:id')
    .patch(protect, isBidOwner, updateBid)
    .delete(protect, isBidOwner, withdrawBid);
=======
import { placeBid, getBidsByGig, hireFreelancer } from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, placeBid);
router.route('/:gigId').get(protect, getBidsByGig);
router.route('/:bidId/hire').patch(protect, hireFreelancer);
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

export default router;
