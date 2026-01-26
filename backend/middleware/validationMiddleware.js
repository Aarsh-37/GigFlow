import { z } from 'zod';

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
        })
    })
});

const placeBidSchema = z.object({
    body: z.object({
        gigId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Gig ID format'),
        message: z.string().min(10, 'Message must be at least 10 characters'),
        price: z.number().positive('Price must be positive'),
    })
});

export {
    validate,
    registerSchema,
    loginSchema,
    createGigSchema,
    placeBidSchema
};
