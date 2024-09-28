import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('CV maker extension')
    .setDescription('cv maker extension for pareto software')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
