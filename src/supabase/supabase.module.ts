import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';
import { SupabaseController } from './supabase.controller.js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { ConfigModule } from '@nestjs/config';
import { SupabaseCvImportService } from './supabase-cv-import.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService, SupabaseClientProvider, SupabaseCvImportService],
  exports: [SupabaseService, SupabaseClientProvider, SupabaseCvImportService],
})
export class SupabaseModule {}
