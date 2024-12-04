import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('CV maker extension')
    .setDescription('cv maker extension for pareto software')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    patchDocumentOnRequest(req: any, _, document) {
      // Set OpenAPI version to 3.1.0
      document.openapi = '3.1.0';

      // Add dynamic servers if request is available
      if (req.headers?.host) {
        document.servers = [
          {
            url: `https://${req.headers.host}`,
            description: 'Current server',
          },
        ];
      }
      return document;
    },
  });

  await app.listen(3000);
}
bootstrap();
