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

export const placeBidSchema = z.object({
    body: z.object({
        gigId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Gig ID format'),
        message: z.string().min(10, 'Message must be at least 10 characters').transform(sanitizeString),
        price: z.number().positive('Price must be positive'),
    })
});

export const updateBidSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Bid ID format'),
    }),
    body: z.object({
        message: z.string().min(10, 'Message must be at least 10 characters').optional().transform(sanitizeString),
        price: z.number().positive('Price must be positive').optional(),
        status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
    }).strict()
});
