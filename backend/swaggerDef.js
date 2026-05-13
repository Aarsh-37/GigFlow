import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GigFlow API Documentation',
      version: '1.0.0',
      description: 'API documentation for the GigFlow freelance marketplace',
    },
    servers: [
      {
        url: 'http://localhost:5000/api', // Assuming backend runs on localhost:5000/api
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
    },
    security: [{ bearerAuth: [] }], // Default security scheme
  },
  apis: ['./backend/routes/*.js', './backend/controllers/*.js', './backend/models/*.js'], // Paths to your API files
};

const specs = swaggerJsdoc(options);

export default specs;
