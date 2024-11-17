import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { Database } from './database.types.js';

@Injectable()
export class SupabaseCvImportService {
  private supabase: SupabaseClient<Database>;

  constructor(
    private readonly supabaseClientProvider: SupabaseClientProvider,
  ) {
    this.supabase = this.supabaseClientProvider.getClient();
  }


  // Insert profile
  async updateProfile(
    profile: Database['public']['Tables']['profiles']['Insert'],
    user_id: string,
  ): Promise<string | null> {
    console.log("PROFILE:");
    console.log(profile);
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        title: profile.title,
        description: profile.description,
        education: profile.education,
        metadata: profile.metadata,
        profile_pic: profile.profile_pic,
        social_media_links: profile.social_media_links,

      })
      .eq('user_id', user_id)
      .select('id');

    if (error) {
      console.log(`Failed to update profile: ${error.message}`);
      return null;
    }
    return data?.[0]?.id.toString();
  }

  // Insert CV
  async insertCv(user_id: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('cvs')
      .insert({
        title: 'AI_generated_CV',
        user_id: user_id,
      })
      .select('id'); 

    if (error) {
      console.log(`Failed to insert CV: ${error.message}`);
      return null;
    }
    // Return CV id
    return data?.[0]?.id.toString();
  }

  // Insert certifications
  async insertCertifications(
    certifications: Record<string, any>,
    user_id: string,
    cv_id: string,
  ): Promise<boolean | null> {
    console.log("CERTS:");
    console.log(certifications);
    const data = certifications.map((key: { name: any; description: any; company: any; start_date: any; end_date: any; role: any; project_category: any; project_url: any; image_url: any; }) => ({
      name: key.name,
      description: key.description,
      company: key.company,
      start_date: key.start_date,
      end_date: key.end_date,
      role: key.role,
      project_category: key.project_category,
      project_url: key.project_url,
      image_url: key.image_url,
      user_id: user_id,
      cv_id: cv_id,
    }));
    const { error } = await this.supabase
      .from('certifications')
      .insert(data);
    if (error)
      throw new Error(`Failed to insert certifications: ${error.message}`);
    return false;
  }


  async insertProjectCategories(
    projectCategories: Record<string, any>[],
    user_id: string,
    cv_id: string,
  ): Promise<boolean | null> {
    console.log("PROJCATS:");
    console.log(projectCategories);
    const data = projectCategories.map((category) => ({
      title: category.title,
      end_date: category.end_date,
      start_date: category.start_date,
      description: category.description,
      user_id: user_id,
      cv_id: cv_id,
    }));
  
    const { error } = await this.supabase.from('project_categories').insert(data);
    if (error) throw new Error(`Failed to insert project categories: ${error.message}`);
    return true;
  }
  

  async insertProjects(
    projects: Record<string, any>[],
    user_id: string,
    cv_id: string,
  ): Promise<boolean | null> {
    console.log("PROJECTS:");
    console.log(projects);
    // not saving keywords or project categories because
    // that requires handling of foreign keys and saving to different tables
    const data = projects.map((project) => ({
      name: project.name,
      description: project.description,
      company: project.company,
      start_date: project.start_date,
      end_date: project.end_date,
      role: project.role,
      project_url: project.project_url,
      image_url: project.image_url,
      user_id: user_id,
      cv_id: cv_id,
    }));
  
    const { error } = await this.supabase.from('projects').insert(data);
    if (error) throw new Error(`Failed to insert projects: ${error.message}`);
    return true;
  }
  

  async insertSkills(
    skills: Record<string, any>[],
    user_id: string,
    cv_id: string,
  ): Promise<boolean | null> {
    console.log("SKILLS:");
    console.log(skills);
    const data = skills.map((skill) => ({
      skill: skill.skill,
      level: skill.level,
      user_id: user_id,
      cv_id: cv_id,
    }));
  
    const { error } = await this.supabase.from('skills').insert(data);
    if (error) throw new Error(`Failed to insert skills: ${error.message}`);
    return true;
  }
  

  /*   async insertKeywords(
    keywords: Database['public']['Tables']['keywords']['Insert'][],
    user_id: string,
    cv_id: string,
  ) {
    const { data, error } = await this.supabase
      .from('keywords')
      .insert(keywords);
    if (error) throw new Error(`Failed to insert keywords: ${error.message}`);
    return data;
  } */
 
}
