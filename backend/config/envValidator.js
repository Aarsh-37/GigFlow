import logger from './logger.js';

/**
 * Validates that all required environment variables are set.
 * Throws an error and exits the process if any are missing.
 */
const validateEnv = () => {
    const requiredEnvVars = [
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'NODE_ENV',
        'FRONTEND_URL'
    ];

    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
        logger.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }

    // Additional specific validations
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'default_secret') {
        logger.warn('WARNING: JWT_SECRET is set to a default value in production! This is insecure.');
    }

    logger.info('Environment variables validated successfully.');
};

export default validateEnv;
