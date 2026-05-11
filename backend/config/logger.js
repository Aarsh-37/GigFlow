import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Log stack traces
    winston.format.splat(),
    winston.format.json(), // Use JSON format for structured logging
    // For development, consider a more human-readable format, but sticking to JSON for consistency
    // winston.format.colorize(), // Add colorization for development if needed
    // winston.format.simple(),
  ),
  transports: [
    // Console transport for logs to stdout
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize console output
        winston.format.simple(), // Simple format for console
      ),
    }),
    // File transport for logs (optional, can be configured for production)
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
