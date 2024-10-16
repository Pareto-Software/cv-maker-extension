import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider'; 
import { SupabaseClientProvider } from './supabase-client.provider'; 
import { Database } from './database.types';
import { ValidTableName } from './table-name.schema';
import { EmployeeDTO } from './dto/employees-response.dto';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor(private supabaseClientProvider: SupabaseClientProvider) {
    this.supabase = this.supabaseClientProvider.supabase;
  }

  async getTableData(table: ValidTableName) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) {
      throw new Error(`Error fetching data from ${table}: ${error.message}`);
    }
    return data;
  }

  async getProfilesData() {
    const { data, error } = await this.supabase.from('profiles').select('*');
    if (error) {
      throw new Error(`Error fetching data from profiles: ${error.message}`);
    }
    return data;
  }

  async getEmployeesSkillsAndProject(): Promise<EmployeeDTO[]>{
    const { data: profiles, error: profileError } = await this.supabase
      .from('profiles')
      .select('user_id, first_name')

    if (profileError) {
      throw new Error(`Error fetching profiles : ${profileError.message}`);
    }

    const { data: skills, error: skillsError } = await this.supabase
      .from('skills')
      .select('user_id, skill')

    if (skillsError) {
      throw new Error(`Error fetching skills : ${skillsError.message}`);
    }

    const { data: projects, error: projectsError } = await this.supabase
      .from('projects')
      .select('user_id, name');

    if (projectsError) {
      throw new Error(`Error fetching projects : ${projectsError.message}`);
    }

    const employees: EmployeeDTO[] = profiles.map((profile) => {
      return {
        name: profile.first_name ?? '',
        skills: skills
          .filter((skill) => skill.user_id === profile.user_id)
          .map((skill) => skill.skill ?? ''),
        projects: projects
          .filter((project) => project.user_id === profile.user_id)
          .map((project) => project.name ?? ''),
      };
    });
    return employees; 
  }
  async insertData(table: ValidTableName, values: any) {
    const { data, error } = await this.supabase.from(table).insert(values);
    if (error) {
      throw new Error(`Error inserting data into ${table}: ${error.message}`);
    }
    return data;
  }
}
