import { z } from 'zod';

const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const createGigSchema = z.object({
    body: z.object({
        title: z.string().min(5, 'Title must be at least 5 characters').transform(sanitizeString),
        description: z.string().min(20, 'Description must be at least 20 characters').transform(sanitizeString),
        budget: z.number().positive('Budget must be positive'),
        deadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
            message: "Invalid date format"
        }),
        category: z.enum(['Design', 'Development', 'Writing', 'Marketing', 'Other'], 'Invalid category').transform(sanitizeString),
        tags: z.array(z.string().transform(sanitizeString)).optional(),
        attachments: z.array(z.string().url('Invalid URL format for attachment')).optional(),
    }).strict()
});

export const updateGigSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Gig ID format'),
    }),
    body: z.object({
        title: z.string().min(5, 'Title must be at least 5 characters').optional().transform(sanitizeString),
        description: z.string().min(20, 'Description must be at least 20 characters').optional().transform(sanitizeString),
        budget: z.number().positive('Budget must be positive').optional(),
        status: z.enum(['open', 'assigned', 'in-progress', 'completed', 'closed'], 'Invalid gig status').optional(),
        deadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
            message: "Invalid date format"
        }),
        category: z.enum(['Design', 'Development', 'Writing', 'Marketing', 'Other'], 'Invalid category').optional().transform(sanitizeString),
        tags: z.array(z.string().transform(sanitizeString)).optional(),
        currency: z.string().optional(),
        attachments: z.array(z.string().url('Invalid URL format for attachment')).optional(),
        views: z.number().int().min(0).optional(),
    }).strict()
});
