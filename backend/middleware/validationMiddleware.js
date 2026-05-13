import { z } from 'zod';
import mongoose from 'mongoose';

const validateObjectId = (field, location = 'params') => (req, res, next) => {
    const id = req[location] && req[location][field];
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid ${field} format` });
    }
    next();
};

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        });
    }
};

// --- Schemas ---

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    })
});

const createGigSchema = z.object({
    body: z.object({
        title: z.string().min(5, 'Title must be at least 5 characters'),
        description: z.string().min(20, 'Description must be at least 20 characters'),
        budget: z.number().positive('Budget must be positive'),
        bidDeadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
            message: "Invalid date format"
        }),
        category: z.enum(['Design', 'Development', 'Writing', 'Marketing', 'Other'], 'Invalid category').optional(),
        tags: z.array(z.string()).optional(),
        attachments: z.array(z.string().url('Invalid URL format for attachment')).optional(),
    }).strict()
});

const updateGigSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Gig ID format'),
    }),
    body: z.object({
        title: z.string().min(5, 'Title must be at least 5 characters').optional(),
        description: z.string().min(20, 'Description must be at least 20 characters').optional(),
        budget: z.number().positive('Budget must be positive').optional(),
        status: z.enum(['open', 'assigned', 'in-progress', 'completed', 'closed'], 'Invalid gig status').optional(),
        deadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
            message: "Invalid date format"
        }),
        category: z.enum(['Design', 'Development', 'Writing', 'Marketing', 'Other'], 'Invalid category').optional(),
        tags: z.array(z.string()).optional(),
        currency: z.string().optional(),
        attachments: z.array(z.string().url('Invalid URL format for attachment')).optional(),
        views: z.number().int().min(0).optional(),
    }).strict()
});

const placeBidSchema = z.object({
    body: z.object({
        gigId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Gig ID format'),
        message: z.string().min(10, 'Message must be at least 10 characters'),
        price: z.number().positive('Price must be positive'),
    })
});

const updateBidSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Bid ID format'),
    }),
    body: z.object({
        price: z.number().positive('Price must be positive').optional(),
        message: z.string().min(10, 'Message must be at least 10 characters').optional(),
        status: z.enum(['pending', 'accepted', 'rejected', 'hired', 'withdrawn'], 'Invalid bid status').optional(),
    }).strict()
});

export {
    validateObjectId,
    validate,
    registerSchema,
    loginSchema,
    createGigSchema,
    updateGigSchema,
    placeBidSchema,
    updateBidSchema
};
