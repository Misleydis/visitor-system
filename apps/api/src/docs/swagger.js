const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi.spec');

const swaggerOptions = {
  customSiteTitle: 'Visitor System API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};

function setupSwagger(app) {
  app.get('/api/docs/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerOptions));
}

module.exports = { setupSwagger, openApiSpec };
