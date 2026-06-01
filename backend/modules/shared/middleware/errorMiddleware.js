import sendResponse from '../utils/sendResponse.js';
import { ZodError } from 'zod';

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message;
    let errors = [];

    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        errors = err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
        }));
    } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    } else if (err.code === 11000) { // MongoDB duplicate key error
        statusCode = 400;
        message = 'Duplicate field value entered';
        const field = Object.keys(err.keyValue)[0];
        if (field) {
            errors.push({ path: field, message: `Duplicate value for ${field}` });
        }
    }

    sendResponse(res, statusCode, false, message,
        process.env.NODE_ENV === 'production' ? errors.length > 0 ? { validationErrors: errors } : null : {
            stack: err.stack,
            validationErrors: errors.length > 0 ? errors : undefined
        });
};

export { notFound, errorHandler };
