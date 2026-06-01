import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';
import Application from '../models/Application.js';

const isGigOwner = asyncHandler(async (req, res, next) => {
    const gigId = req.params.gigId || req.body.gigId || req.params.id;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Internship not found');
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(403); // Use 403 Forbidden for ownership issues
        throw new Error('Not authorized: You do not own this internship');
    }

    req.gig = gig;
    next();
});

const isApplicationOwner = asyncHandler(async (req, res, next) => {
    const applicationId = req.params.applicationId || req.body.applicationId || req.params.id;
    const application = await Application.findById(applicationId);

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    if (application.internId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized: You do not own this application');
    }

    req.application = application;
    next();
});

const isGigOwnerOrHiredIntern = asyncHandler(async (req, res, next) => {
    const gigId = req.params.gigId || req.body.gigId || req.params.id;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Internship not found');
    }

    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const isHired = await Application.exists({ 
        gigId, 
        internId: req.user._id, 
        status: 'HIRED' 
    });

    if (!isOwner && !isHired) {
        res.status(403);
        throw new Error('Not authorized: Access denied');
    }

    req.gig = gig;
    next();
});

export { isGigOwner, isApplicationOwner, isGigOwnerOrHiredIntern };
