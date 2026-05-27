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
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: "Cookie-based JWT authentication",
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js'], // Paths to your API files
};

const specs = swaggerJsdoc(options);

export default specs;
