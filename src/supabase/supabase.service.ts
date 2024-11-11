import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider';
import { Database } from './database.types';
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

  async getProfilesData() {
    const { data, error } = await this.supabase.from('profiles').select('*');
    if (error) {
      throw new Error(`Error fetching data from profiles: ${error.message}`);
    }
    return data;
  }

  async getEmployeesSkillsAndProject(): Promise<EmployeeDTO[]> {
    const { data: profiles, error: profileError } = await this.supabase
      .from('profiles')
      .select('user_id, first_name, last_name');
    if (profileError) {
      throw new Error(`Error fetching profiles : ${profileError.message}`);
    }

    const { data: skills, error: skillsError } = await this.supabase
      .from('skills')
      .select('user_id, skill');

    if (skillsError) {
      throw new Error(`Error fetching skills : ${skillsError.message}`);
    }

    const { data: projects, error: projectsError } = await this.supabase
      .from('projects')
      .select('id, user_id, name');

    if (projectsError) {
      throw new Error(`Error fetching projects : ${projectsError.message}`);
    }

    const { data: certifications, error: certificationsError } =
      await this.supabase.from('certifications').select('user_id, name');
    if (certificationsError) {
      throw new Error(
        `Error fetching certificates : ${certificationsError.message}`,
      );
    }

    const { data: projectKeywords, error: projectKeywordsError } =
      await this.supabase
        .from('project_keywords')
        .select('project_id, keyword_id');
    if (projectKeywordsError) {
      throw new Error(
        `Error fetching project keywords : ${projectKeywordsError.message}`,
      );
    }

    const { data: keywords, error: keywordsError } = await this.supabase
      .from('keywords')
      .select('id, name');
    if (keywordsError) {
      throw new Error(`Error fetching keywords : ${keywordsError.message}`);
    }

    const projectKeywordsWithNames = projectKeywords.map((projectKeyword) => ({
      ...projectKeyword,
      keyword:
        keywords.find((keyword) => keyword.id === projectKeyword.keyword_id)
          ?.name ?? '',
    }));
    //projectKeyword.keyword_id== keyword.id

    const employees: EmployeeDTO[] = profiles.map((profile) => {
      const employeeSkills = skills
        .filter((skill) => skill.user_id === profile.user_id)
        .map((skill) => skill.skill ?? '');

      const employeeProjects = projects
        .filter((project) => project.user_id === profile.user_id)
        .map((project) => ({
          name: project.name ?? '',
          keywords: projectKeywordsWithNames
            .filter(
              (projectKeyword) => projectKeyword.project_id === project.id,
            )
            .map((projectKeyword) => projectKeyword.keyword ?? ''),
        }));

      const employeeCertifications = certifications
        .filter((certificate) => certificate.user_id === profile.user_id)
        .map((certificate) => certificate.name ?? '');

      return {
        name: `${profile.first_name} ${profile.last_name}`,
        skills: employeeSkills,
        projects: employeeProjects,
        certifications: employeeCertifications,
      };
    });
    return employees;
  }

  async getEmployeesFullInformation(
    firstName: string,
    lastName: string,
  ): Promise<EmployeeFullDetailDTO> {
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select(
        `
        user_id,
        first_name,
        last_name,
        title,
        description,
        education
        `,
      )
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single();

    if (profileError || !profile) {
      throw new Error(
        `Error fetching profile: ${profileError?.message || 'Profile not found'}`,
      );
    }

    const educationData = profile.education
      ? JSON.parse(profile.education)
      : {};
    const education = educationData as EducationDTO;

    const { data: skills, error: skillsError } = await this.supabase
      .from('skills')
      .select('skill, level')
      .eq('user_id', profile.user_id);

    if (skillsError) {
      throw new Error(`Error fetching skills: ${skillsError.message}`);
    }

    const { data: projects, error: projectsError } = await this.supabase
      .from('projects')
      .select('name, description, company, role, start_date, end_date')
      .eq('user_id', profile.user_id);

    if (projectsError) {
      throw new Error(`Error fetching projects: ${projectsError.message}`);
    }

    const { data: certifications, error: certificationsError } =
      await this.supabase
        .from('certifications')
        .select('name, received, valid_until')
        .eq('user_id', profile.user_id);

    if (certificationsError) {
      throw new Error(
        `Error fetching certifications: ${certificationsError.message}`,
      );
    }

    const employee: EmployeeFullDetailDTO = {
      name: `${profile.first_name} ${profile.last_name}`,
      title: profile.title ?? '',
      description: profile.description ?? '',
      education: {
        school: education.school ?? '',
        graduationYear: Number(education.graduationYear) || 0,
        degree: education.degree ?? '',
        field: education.field ?? '',
        thesis: education.thesis ?? '',
      },
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
    };

    return employee;
  }
}
