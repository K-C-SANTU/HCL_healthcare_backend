const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HCL Healthcare API Documentation',
      version: '1.0.0',
      description: 'API documentation for HCL Healthcare Management System',
      contact: {
        name: 'API Support',
        email: 'support@hcl-squad11.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'https://hcl-healthcare-backend.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message description',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data object',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Shifts',
        description: 'Shift management and staff assignment',
      },
      {
        name: 'Leaves',
        description: 'Leave requests and management',
      },
      {
        name: 'Attendance',
        description: 'Staff attendance tracking and management',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
