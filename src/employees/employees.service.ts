import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable() 
export class EmployeesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getEmployeesSkillsAndProjects() {
    return await this.supabaseService.getEmployeesSkillsAndProject();
  }
}