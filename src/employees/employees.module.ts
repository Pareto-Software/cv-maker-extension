import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, SupabaseService],
})

export class EmployeesModule {}
