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

export const updateUserProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional().transform(sanitizeString),
        bio: z.string().min(10, 'Bio must be at least 10 characters').optional().transform(sanitizeString),
        skills: z.array(z.string().transform(sanitizeString)).optional(),
        avatar: z.string().url('Invalid URL format for avatar').optional(),
        linkedin: z.string().url('Invalid URL format for LinkedIn').optional(),
        github: z.string().url('Invalid URL format for GitHub').optional(),
        twitter: z.string().url('Invalid URL format for Twitter').optional(),
    }).strict().partial(),
});
