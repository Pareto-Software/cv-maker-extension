import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CvImportController } from './cv-import.controller.js';
import { CvImportService } from './cv-import.service.js';
import { SupabaseClientProvider } from '../supabase/supabase-client.provider.js';
import { JwtModule } from '../jwt/jwt.module.js';
import { PdfParserService } from './pdfParser.service.js';

// Configures the module’s dependencies and structure.
@Module({
  imports: [ConfigModule, JwtModule],
  controllers: [CvImportController],
  providers: [CvImportService, SupabaseClientProvider, PdfParserService],
})
export class CvImportModule {}
