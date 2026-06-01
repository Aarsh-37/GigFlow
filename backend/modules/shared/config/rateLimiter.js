import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import logger from './logger.js';

let redisClient;
// Only use Redis if configured and NOT pointing to localhost in production
const isRedisConfigured = process.env.REDIS_URL && 
    !(process.env.NODE_ENV === 'production' && process.env.REDIS_URL.includes('127.0.0.1'));

if (isRedisConfigured && process.env.NODE_ENV !== 'test') {
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
    } catch (error) {
        logger.error(`Failed to initialize Redis for rate limiting: ${error.message}`);
    }
}

// Factory function to create a new store instance for each limiter
const createStore = (prefix) => {
    if (redisClient) {
        return new RedisStore({
            // @ts-expect-error - Known issue with rate-limit-redis types and ioredis
            sendCommand: (...args) => redisClient.call(...args),
            prefix: prefix
        });
    }
    return undefined; // Let express-rate-limit fall back to MemoryStore
};
/**
 * Global Rate Limiter
 * Limits each IP to 5000 requests per 15 minutes.
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // Increased to prevent blocking during development/testing
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore('rl:global:'),
});

/**
 * Strict Rate Limiter for Authentication
 * Limits login/register attempts to 500 per 15 minutes.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore('rl:auth:'),
});

/**
 * Rate Limiter for critical operations (e.g., payment, status changes)
 * Limits to 500 requests per 15 minutes.
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased
    message: 'Too many attempts for this action, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore('rl:strict:'),
});
