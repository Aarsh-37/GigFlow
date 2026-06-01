import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import logger from './logger.js';

let redisClient;
let store;

if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
    try {
        redisClient = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false
        });

        redisClient.on('error', (err) => {
            logger.error(`Rate Limiter Redis error: ${err.message}`);
        });

        redisClient.on('connect', () => {
            logger.info('Rate Limiter Redis connected successfully');
        });

        store = new RedisStore({
            // @ts-expect-error - Known issue with rate-limit-redis types and ioredis
            sendCommand: (...args) => redisClient.call(...args),
        });
    } catch (error) {
        logger.error(`Failed to initialize Redis for rate limiting: ${error.message}`);
    }
}

/**
 * Global Rate Limiter
 * Limits each IP to 100 requests per 15 minutes.
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') ? 10000 : 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    store: store,
});

/**
 * Strict Rate Limiter for Authentication
 * Limits login/register attempts to 10 per 15 minutes.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') ? 1000 : 10,
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    store: store,
});

/**
 * Rate Limiter for critical operations (e.g., payment, status changes)
 * Limits to 20 requests per 15 minutes.
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') ? 1000 : 20,
    message: 'Too many attempts for this action, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: store,
});
