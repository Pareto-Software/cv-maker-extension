import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseController } from './supabase.controller';
import { SupabaseClientProvider } from './supabase-client.provider';
import { ConfigModule } from '@nestjs/config';
import { PdfProcessingService } from 'src/cv-import/pdf-parse.service';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService, SupabaseClientProvider, PdfProcessingService],
  exports: [SupabaseService, SupabaseClientProvider],
})
export class SupabaseModule {}
