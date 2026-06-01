import asyncHandler from 'express-async-handler';
import * as applicationService from '../services/applicationService.js';
import sendResponse from '../../shared/utils/sendResponse.js';
import { uploadBufferToCloudinary } from '../../shared/utils/cloudinaryUtils.js';
import { saveFileLocally } from '../../shared/middleware/uploadMiddleware.js';

/**
 * @desc    Apply for a gig
 * @route   POST /api/v1/applications
 * @access  Private/Intern
 */
export const applyForGig = asyncHandler(async (req, res) => {
    let resumeUrl = req.body.resume;

    // If a file was uploaded, store it
    if (req.file) {
        const cloudinaryConfigured =
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET;

        if (cloudinaryConfigured) {
            // Upload to Cloudinary (cloud storage)
            try {
                resumeUrl = await uploadBufferToCloudinary(req.file.buffer, 'gigflow_resumes', 'auto');
            } catch (uploadError) {
                res.status(500);
                throw new Error('Failed to upload resume to cloud. Please try again or provide a URL.');
            }
        } else {
            // Fallback: save to local uploads/ directory
            try {
                const localPath = saveFileLocally(req.file.buffer, req.file.originalname || 'resume.pdf');
                // Build the full URL using the server's base URL
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                resumeUrl = `${baseUrl}${localPath}`;
            } catch (saveError) {
                res.status(500);
                throw new Error('Failed to save resume file. Please provide a resume URL instead.');
            }
        }
    }

    if (!resumeUrl) {
        res.status(400);
        throw new Error('Please provide a resume URL or upload a resume file');
    }

    const applicationData = {
        ...req.body,
        resume: resumeUrl,
        internId: req.user._id,
    };

    try {
        const application = await applicationService.createApplication(applicationData);
        sendResponse(res, 201, true, 'Application submitted successfully', application);
    } catch (err) {
        res.status(err.statusCode || 400);
        throw err;
    }
});

/**
 * @desc    Update application status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private/Hirer
 */
export const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const hirerId = req.user._id;

    const application = await applicationService.updateApplicationStatus(id, hirerId, status);

    sendResponse(res, 200, true, `Application status updated to ${status}`, application);
});

/**
 * @desc    Get applications for a specific gig
 * @route   GET /api/v1/applications/gig/:gigId
 * @access  Private/Hirer
 */
export const getGigApplications = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const hirerId = req.user._id;
    const { limit, cursor } = req.query;

    const result = await applicationService.getApplicationsByGig(gigId, hirerId, { limit: parseInt(limit), cursor });

    sendResponse(res, 200, true, 'Applications retrieved successfully', result);
});

/**
 * @desc    Get applications of the current intern
 * @route   GET /api/v1/applications/my-applications
 * @access  Private/Intern
 */
export const getMyApplications = asyncHandler(async (req, res) => {
    const internId = req.user._id;
    const { limit, cursor } = req.query;

    const result = await applicationService.getApplicationsByIntern(internId, { limit: parseInt(limit), cursor });

    sendResponse(res, 200, true, 'Your applications retrieved successfully', result);
});
