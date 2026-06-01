import winston from 'winston';
import 'winston-daily-rotate-file';
import { als } from '../middleware/requestId.js';

const customFormat = winston.format.printf((info) => {
    const store = als.getStore();
    return JSON.stringify({
      ...info,
      requestId: store?.requestId ?? 'system'
    });
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, requestId, stack, ...meta }) => {
            const reqId = als.getStore()?.requestId || 'system';
            return `${timestamp} [${reqId}] ${level}: ${message} ${stack || ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

export default logger;
