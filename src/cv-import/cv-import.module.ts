import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CvImportController } from './cv-import.controller';
import { CvImportService } from './cv-import.service';
import { SupabaseClientProvider } from 'src/supabase/supabase-client.provider';
import { JwtModule } from 'src/jwt/jwt.module';
import { PdfParserService } from './pdfParser.service';

// Configures the module’s dependencies and structure.
@Module({
  imports: [ConfigModule, JwtModule],
  controllers: [CvImportController],
  providers: [CvImportService, SupabaseClientProvider, PdfParserService],
})
export class CvImportModule {}
