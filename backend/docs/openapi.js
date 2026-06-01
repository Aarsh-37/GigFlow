import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { createApplicationSchema } from '../modules/shared/validations/applicationSchema.js';
import { registerSchema, loginSchema } from '../modules/shared/validations/authSchema.js';
import { createGigSchema } from '../modules/shared/validations/gigSchema.js';
import logger from '../modules/shared/config/logger.js';

// REQUIRED: Extend Zod with the .openapi() method before calling registry.register()
// Without this, registry.register() throws: "zodSchema.openapi is not a function"
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

let openApiDocument = { openapi: '3.0.0', info: { title: 'GigFlow API', version: '1.0.0' }, paths: {} };

try {
    // Register Schemas
    const GigSchema = registry.register('Gig', createGigSchema.shape.body);
    const ApplicationSchema = registry.register('Application', createApplicationSchema.shape.body);
    const RegisterSchema = registry.register('Register', registerSchema.shape.body);
    const LoginSchema = registry.register('Login', loginSchema.shape.body);

    // Register Paths
    registry.registerPath({
        method: 'post',
        path: '/api/v1/auth/login',
        summary: 'User login',
        request: {
            body: {
                content: {
                    'application/json': { schema: LoginSchema }
                }
            }
        },
        responses: {
            200: { description: 'Login successful' }
        }
    });

    registry.registerPath({
        method: 'post',
        path: '/api/v1/auth/register',
        summary: 'Register a new user',
        request: {
            body: {
                content: {
                    'application/json': { schema: RegisterSchema }
                }
            }
        },
        responses: {
            201: { description: 'User registered successfully' }
        }
    });

    registry.registerPath({
        method: 'get',
        path: '/api/v1/gigs',
        summary: 'List open gigs',
        responses: {
            200: {
                description: 'Paginated gig list',
                content: { 'application/json': { schema: z.array(GigSchema) } }
            }
        }
    });

    registry.registerPath({
        method: 'post',
        path: '/api/v1/applications',
        summary: 'Apply for a gig',
        request: {
            body: {
                content: {
                    'application/json': { schema: ApplicationSchema }
                }
            }
        },
        responses: {
            201: { description: 'Application submitted successfully' }
        }
    });

    const generator = new OpenApiGeneratorV3(registry.definitions);
    openApiDocument = generator.generateDocument({
        openapi: '3.0.0',
        info: { title: 'GigFlow API', version: '1.0.0' },
        servers: [{ url: 'http://localhost:5000' }]
    });

    logger.info('OpenAPI document generated successfully.');
} catch (err) {
    logger.error('Failed to generate OpenAPI document. Swagger UI will be unavailable.', err.message);
}

export { openApiDocument };
