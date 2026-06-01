import { Queue, Worker } from 'bullmq';
import redis from './redis.js';
import logger from './logger.js';

/**
 * Creates a BullMQ Queue with standardized job options (retries, backoff).
 */
const createQueue = (name) => {
    if (!redis) {
        logger.error(`Cannot create queue ${name}: Redis connection not available.`);
        return null;
    }

    const queue = new Queue(name, {
        connection: redis,
        defaultJobOptions: {
            attempts: 3, // Retry 3 times
            backoff: {
                type: 'exponential',
                delay: 2000, // Wait 2s, then 4s, then 8s
            },
            removeOnComplete: true, // Keep Redis clean
            removeOnFail: false, // Keep failed jobs for manual inspection (DLQ)
        }
    });

    logger.info(`Queue ${name} initialized successfully.`);
    return queue;
};

/**
 * Creates a BullMQ Worker with standardized error handling and failure alerting.
 */
const createWorker = (name, handler) => {
    if (!redis) {
        logger.error(`Cannot create worker for ${name}: Redis connection not available.`);
        return null;
    }

    const worker = new Worker(name, handler, { connection: redis });

    // Log and alert on permanent failure (after all retries exhausted)
    worker.on('failed', (job, err) => {
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
            logger.error('Job permanently failed after all retries', {
                queue: name,
                jobId: job.id,
                jobName: job.name,
                data: job.data,
                error: err.message,
                attempts: job.attemptsMade
            });
            // PRO TIP: Hook into Sentry, PagerDuty, or Slack here
        } else {
            logger.warn(`Job ${job.id} in ${name} failed. Retrying... (${job.attemptsMade} attempts made)`);
        }
    });

    worker.on('error', (err) => {
        logger.error(`Worker error in queue ${name}: ${err.message}`);
    });

    logger.info(`Worker for ${name} initialized successfully.`);
    return worker;
};

export { createQueue, createWorker };
