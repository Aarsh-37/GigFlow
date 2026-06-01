import { z } from 'zod';

export const createApplicationSchema = z.object({
    body: z.object({
        gigId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Gig ID'),
        coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters'),
        resume: z.string().url('Invalid resume URL').optional().or(z.literal(''))
    })
});

export const updateApplicationStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Application ID')
    }),
    body: z.object({
        status: z.enum(['APPLIED', 'HIRED', 'REJECTED'])
    })
});
