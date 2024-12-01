import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { SupabaseModule } from './supabase/supabase.module';
import { AllocationModule } from './allocation/allocation.module';
import { ContextModule } from './context/context.module';
import { SheetModule } from './sheet/sheet.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './oauth2/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SupabaseModule,
    AllocationModule,
    SheetModule,
    ContextModule,
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
