import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger.js';
import { generateInvoice } from '../services/invoiceService.js';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

const notificationQueue = new Queue('notifications', { connection });

const worker = new Worker('notifications', async (job) => {
  logger.info(`Processing background job ${job.id}: ${job.name}`);
  
  if (job.name === 'generate_invoice') {
    await generateInvoice(job.data);
  }

  // In a real scenario, this would send an email or push notification
  logger.info(`Completed background job ${job.id}`);
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

export { notificationQueue };
