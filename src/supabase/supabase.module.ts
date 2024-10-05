import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseController } from './supabase.controller';
import { SupabaseClientProvider } from './supabase-client.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService,SupabaseClientProvider],
  exports: [SupabaseService],
})
export class SupabaseModule {}
