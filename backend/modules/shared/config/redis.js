import Redis from 'ioredis';
import logger from './logger.js';

let redis;

if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    });

    redis.on('error', (err) => {
        logger.error(`Redis connection error: ${err.message}`);
    });

    redis.on('connect', () => {
        logger.info('Redis connected successfully');
    });
} else {
    logger.warn('REDIS_URL not found in environment variables. Redis-dependent features will be disabled.');
}

export default redis;
