import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'; // This import is correct for ESM

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Consultant CUSC API',
      version: '1.0.0',
      description: 'A simple consultant API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/docs/components.yaml'],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
