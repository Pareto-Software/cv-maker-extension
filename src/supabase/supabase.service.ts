import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider'; 
import { Database } from './database.types';
import { ValidTableName } from './table-name.schema';
import {
  EmployeeDTO,
  SkillDTO,	
  ProjectDTO,
  CertificationDTO,
  EducationDTO,
  EmployeeFullDetailDTO,
} from './dto/employees-response.dto';

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

  async getEmployeesFullInformation(
    firstName: string,
    lastName: string
  ): Promise<EmployeeFullDetailDTO> {
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select(
        'user_id, first_name,last_name, title, description, education->school, education->graduationYear, education->degree, education->field, education->thesis',
      )
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single();

    if (profileError || !profile) {
      throw new Error(
        `Error fetching profiles : ${profileError?.message || 'Profile not found'}`,
      );
    }
    const { data: skills, error: skillsError } = await this.supabase
      .from('skills')
      .select('skill, level')
      .eq('user_id', profile.user_id);

    if (skillsError) {
      throw new Error(`Error fetching skills : ${skillsError.message}`);
    }

    const { data: projects, error: projectsError } = await this.supabase
      .from('projects')
      .select('name, description, company, role, start_date, end_date')
      .eq('user_id', profile.user_id);

    if (projectsError) {
      throw new Error(`Error fetching projects : ${projectsError.message}`);
    }

    const { data: certifications, error: certificationsError } =
      await this.supabase
        .from('certifications')
        .select('name, received, valid_until')
        .eq('user_id', profile.user_id);
      
    if (certificationsError) {
      throw new Error(
        `Error fetching certifications : ${certificationsError.message}`,
      );
    }

    const employee: EmployeeFullDetailDTO = {
      name: `${profile.first_name} ${profile.last_name}`,
      title: profile.title ?? '',
      description: profile.description ?? '',
      education: {
        school: profile.school,
        graduationYear: profile.graduationYear ?? '',
        degree: profile.degree ?? '',
        field: profile.field ?? '',
        thesis: profile.thesis ?? '',
      } as EducationDTO,
      skills: skills.map((skill) => ({
        name: skill.skill ?? '',
        level: skill.level,
      })) as SkillDTO[],
      projects: projects.map((project) => ({
        name: project.name ?? '',
        description: project.description ?? '',
        company: project.company ?? '',
        role: project.role ?? '',
        start_date: project.start_date ?? '',
        end_date: project.end_date ?? '',
      })) as ProjectDTO[],
      certifications: certifications.map((certification) => ({
        name: certification.name ?? '',
        received: certification.received ?? '',
        valid_until: certification.valid_until ?? '',
      })) as CertificationDTO[],
    }
    return employee;
  }
  async insertData(table: ValidTableName, values: any) {
    const { data, error } = await this.supabase.from(table).insert(values);
    if (error) {
      throw new Error(`Error inserting data into ${table}: ${error.message}`);
    }
    return data;
  }
}
