import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';
import { SupabaseController } from './supabase.controller.js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { ConfigModule } from '@nestjs/config';
import { PdfParserService } from '../cv-import/pdfParser.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService, SupabaseClientProvider, PdfParserService],
  exports: [SupabaseService, SupabaseClientProvider],
})
export class SupabaseModule {}
