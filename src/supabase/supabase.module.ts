import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseController } from './supabase.controller';
import { SupabaseClientProvider } from './supabase-client.provider';
import { ConfigModule } from '@nestjs/config';
import { PdfParserService } from 'src/cv-import/pdfParser.service';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService, SupabaseClientProvider, PdfParserService],
  exports: [SupabaseService, SupabaseClientProvider],
})
export class SupabaseModule {}
