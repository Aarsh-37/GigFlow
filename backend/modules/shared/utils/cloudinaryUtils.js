import { cloudinary } from '../config/cloudinary.js';

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * Useful when using multer memory storage.
 */
export const uploadBufferToCloudinary = (buffer, folder = 'gigflow_resumes', resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};
