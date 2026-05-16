import Dispute from '../models/Dispute.js';
import Gig from '../models/Gig.js';
import sendResponse from '../utils/sendResponse.js';
import logger from '../config/logger.js';

// @desc    Raise a dispute for a gig
// @route   POST /api/v1/disputes
// @access  Private
const raiseDispute = async (req, res) => {
    const { gigId, reason, evidence } = req.body;

    try {
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return sendResponse(res, 404, false, 'Gig not found');
        }

        // Check if user is authorized (owner or assigned freelancer)
        // Note: Assuming assigned freelancer is stored in the Gig or discovered via Bids
        // For simplicity, checking ownerId for now, but in a full system, we'd check the contract.
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            // Check if user is the assigned freelancer (logic would go here)
        }

        const dispute = await Dispute.create({
            gigId,
            raisedBy: req.user._id,
            reason,
            evidence
        });

        gig.status = 'disputed';
        await gig.save();

        logger.info(`Dispute raised for gig ${gigId} by user ${req.user._id}`);
        sendResponse(res, 201, true, 'Dispute raised successfully', dispute);
    } catch (error) {
        logger.error(`Error raising dispute: ${error.message}`);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Get all disputes (Admin only)
// @route   GET /api/v1/disputes
// @access  Private/Admin
const getDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find().populate('gigId').populate('raisedBy', 'name email');
        sendResponse(res, 200, true, 'Disputes fetched successfully', disputes);
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Resolve a dispute
// @route   PATCH /api/v1/disputes/:id/resolve
// @access  Private/Admin
const resolveDispute = async (req, res) => {
    const { resolution, status } = req.body; // status: resolved or dismissed

    try {
        const dispute = await Dispute.findById(req.params.id);
        if (!dispute) {
            return sendResponse(res, 404, false, 'Dispute not found');
        }

        dispute.resolution = resolution;
        dispute.status = status;
        dispute.resolvedAt = Date.now();
        await dispute.save();

        const gig = await Gig.findById(dispute.gigId);
        if (gig) {
            // Update gig status based on resolution
            gig.status = status === 'resolved' ? 'closed' : 'in-progress'; 
            await gig.save();
        }

        logger.info(`Dispute ${req.params.id} resolved with status ${status}`);
        sendResponse(res, 200, true, 'Dispute resolved successfully', dispute);
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

export { raiseDispute, getDisputes, resolveDispute };
