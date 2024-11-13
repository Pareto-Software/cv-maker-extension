import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { dump as yamlDump } from 'js-yaml';
import { INestApplication } from '@nestjs/common';


// Function to create the OpenAPI document with dynamic servers
function createOpenApiDocument(app: INestApplication, req?: Request) {
  const config = new DocumentBuilder()
    .setTitle('CV maker extension')
    .setDescription('cv maker extension for pareto software')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Set OpenAPI version to 3.1.0
  document.openapi = '3.1.0';

  // Add dynamic servers if request is available
  if (req?.headers?.host) {
    document.servers = [
      {
        url: `https://${req.headers.host}`,
        description: 'Current server',
      },
    ];
  }

  return document;
}

// Setup routes for different OpenAPI document formats
function setupOpenApiRoutes(app: INestApplication) {
  // Handler for YAML format
  app.use('/api-yaml', (req: Request, res: Response) => {
    try {
      const document = createOpenApiDocument(app, req);
      res.type('application/yaml').send(yamlDump(document));
    } catch (err) {
      console.error('Error generating YAML OpenAPI documentation:', err);
      res.status(500).send('Error generating OpenAPI documentation');
    }
  });

  // Handler for JSON format
  app.use('/api-json', (req: Request, res: Response) => {
    try {
      const document = createOpenApiDocument(app, req);
      res.type('application/json').send(document);
    } catch (err) {
      console.error('Error generating JSON OpenAPI documentation:', err);
      res.status(500).send('Error generating OpenAPI documentation');
    }
  });

  // Setup standard Swagger UI with base document
  const baseDocument = createOpenApiDocument(app);
  SwaggerModule.setup('api', app, baseDocument);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());

  // Setup all OpenAPI routes
  setupOpenApiRoutes(app);

  await app.listen(3000);
}
bootstrap();
