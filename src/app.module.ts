import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AllocationModule } from './allocation/allocation.module';
import { SheetModule } from './sheet/sheet.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SupabaseModule,
    AllocationModule,
    SheetModule,
  ,  EmployeesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
