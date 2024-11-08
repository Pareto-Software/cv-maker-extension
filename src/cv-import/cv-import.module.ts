import { Module } from '@nestjs/common';
import { CvImportController } from './cv-import.controller';
import { CvImportService } from './cv-import.service';
import { SupabaseClientProvider } from 'src/supabase/supabase-client.provider';

// Configures the module’s dependencies and structure.
@Module({
  controllers: [CvImportController],
  providers: [CvImportService, SupabaseClientProvider],
})
export class CvImportModule {}
