import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AllocationModule } from './allocation/allocation.module.js';
import { SheetModule } from './sheet/sheet.module.js';
import { CvImportModule } from './cv-import/cv-import.module.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './oauth2/auth.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SupabaseModule,
    AllocationModule,
    SheetModule,
    CvImportModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
