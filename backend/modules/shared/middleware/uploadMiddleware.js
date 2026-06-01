import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the uploads directory relative to project root (backend/uploads/)
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Always use memory storage so we can validate file type before deciding where to store
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

/**
 * Middleware to validate file type using magic bytes
 */
export const validateFileType = (allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']) => {
    return async (req, res, next) => {
        if (!req.file) {
            return next(); // No file uploaded, skip validation
        }

        try {
            // Read magic bytes from buffer
            const fileType = await fileTypeFromBuffer(req.file.buffer);

            if (!fileType || !allowedTypes.includes(fileType.mime)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid file type. Allowed types: PDF, JPG, PNG`,
                });
            }

            // Assign the verified mime type
            req.file.verifiedMimeType = fileType.mime;
            next();
        } catch (error) {
            next(new Error('File validation failed'));
        }
    };
};

/**
 * Saves an uploaded file buffer to the local uploads/ directory.
 * Returns the public URL path to access the file.
 * Used as a fallback when Cloudinary is not configured.
 *
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} originalName - Original filename for extension extraction
 * @returns {string} Public URL like /uploads/resume-<timestamp>-<random>.pdf
 */
export const saveFileLocally = (buffer, originalName) => {
    const ext = path.extname(originalName) || '.pdf';
    const filename = `resume-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    // Return a URL path that will be served as a static file
    return `/uploads/${filename}`;
};
