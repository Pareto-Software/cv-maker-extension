import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AllocationModule } from './allocation/allocation.module.js';
import { SheetModule } from './sheet/sheet.module.js';
import { CvImportModule } from './cv-import/cv-import.module.js';

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
