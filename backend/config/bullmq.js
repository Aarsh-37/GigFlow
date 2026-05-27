import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger.js';
import { generateInvoice } from '../services/invoiceService.js';

dotenv.config();

const connection = process.env.NODE_ENV !== 'test' 
  ? new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { 
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    })
  : null;

if (connection) {
  connection.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);
  });
}

const notificationQueue = process.env.NODE_ENV !== 'test' ? new Queue('notifications', { connection }) : null;

const worker = process.env.NODE_ENV !== 'test' ? new Worker('notifications', async (job) => {
  logger.info(`Processing background job ${job.id}: ${job.name}`);
  
  if (job.name === 'generate_invoice') {
    await generateInvoice(job.data);
  }

  logger.info(`Completed background job ${job.id}`);
}, { connection }) : null;

if (process.env.NODE_ENV !== 'test') {
    worker.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed: ${err.message}`);
    });
}

export { notificationQueue };
