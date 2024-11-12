import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import yaml from 'yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('CV maker extension')
    .setDescription('cv maker extension for pareto software')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  document.openapi = '3.1.0';

  // get the host from the request headers
  app.use('/api-yaml', (req: Request, res: Response) => {
    try {
      const host = req.headers.host as string;

      const customDoc = {
        ...document,
        servers: [
          {
            url: `https://${host}`,
            description: 'Current server',
          },
        ],
      };

      res.type('application/yaml').send(yaml.stringify(customDoc));
    } catch (err) {
      console.error('Error generating OpenAPI documentation:', err);
      res.status(500).send('Error generating OpenAPI documentation');
    }
  });

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
