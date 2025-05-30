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
        email: 'support@hcl-squad11.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './routes/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 