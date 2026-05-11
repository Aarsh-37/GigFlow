import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { gigId, revieweeId, rating, comment } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.status !== 'completed' && gig.status !== 'closed') {
        res.status(400);
        throw new Error('Reviews can only be left for completed or closed gigs');
    }

    const existingReview = await Review.findOne({ gigId, reviewerId: req.user._id });
    if (existingReview) {
        res.status(400);
        throw new Error('You have already reviewed this gig');
    }

    const review = await Review.create({
        gigId,
        reviewerId: req.user._id,
        revieweeId,
        rating,
        comment
    });

    // Update user average rating
    const reviews = await Review.find({ revieweeId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await User.findByIdAndUpdate(revieweeId, {
        averageRating: avgRating.toFixed(1)
    });

    res.status(201).json(review);
});

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:id
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ revieweeId: req.params.id })
        .populate('reviewerId', 'name profilePic')
        .sort({ createdAt: -1 });

    res.json(reviews);
});

export { createReview, getUserReviews };
