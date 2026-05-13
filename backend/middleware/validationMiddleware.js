import mongoose from 'mongoose';

/**
 * Middleware to validate request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        });
    }
};

/**
 * Middleware to validate MongoDB ObjectId format.
 * @param {string} field - The field name in req[location].
 * @param {string} location - The location in req (params, body, query).
 */
const validateObjectId = (field, location = 'params') => (req, res, next) => {
    const id = req[location] && req[location][field];
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false,
            message: `Invalid ${field} format` 
        });
    }
    next();
};

export { validate, validateObjectId };
