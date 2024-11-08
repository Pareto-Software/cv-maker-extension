import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { SupabaseModule } from './supabase/supabase.module';
import { AllocationModule } from './allocation/allocation.module';
import { SheetModule } from './sheet/sheet.module';
import { CvImportModule } from './cv-import/cv-import.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SupabaseModule,
    AllocationModule,
    SheetModule,
    CvImportModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
