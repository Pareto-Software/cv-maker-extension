import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CvImportController } from './cv-import.controller.js';
import { CvImportService } from './cv-import.service.js';
import { JwtModule } from '../jwt/jwt.module.js';
import { DocumentParserService } from './service/documentParser.service.js';
import { OpenAiAPIService } from './service/openai.service.js';
import { SupabaseModule } from '../supabase/supabase.module.js';

// Configures the module’s dependencies and structure.
@Module({
  imports: [ConfigModule, JwtModule, SupabaseModule],
  controllers: [CvImportController],
  providers: [CvImportService, DocumentParserService, OpenAiAPIService],
})
export class CvImportModule {}
