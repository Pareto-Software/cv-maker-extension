import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider';
import { Database } from './database.types';
import { PdfParserService } from 'src/cv-import/pdfParser.service';

@Injectable()
export class SupabaseCvImportService {
  private supabase: SupabaseClient<Database>;

  constructor(
    private readonly supabaseClientProvider: SupabaseClientProvider,
    private readonly pdfProcessingService: PdfParserService,
  ) {
    this.supabase = this.supabaseClientProvider.getClient();
  }

  // Insert profile
  async insertProfile(
    profile: Database['public']['Tables']['profiles']['Insert'],
  ) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(profile);
    if (error) throw new Error(`Failed to insert profile: ${error.message}`);
    return data;
  }

  // Insert certifications
  async insertCertifications(
    certifications: Database['public']['Tables']['certifications']['Insert'][],
  ) {
    const { data, error } = await this.supabase
      .from('certifications')
      .insert(certifications);
    if (error)
      throw new Error(`Failed to insert certifications: ${error.message}`);
    return data;
  }

  // Insert keywords
  async insertKeywords(
    keywords: Database['public']['Tables']['keywords']['Insert'][],
  ) {
    const { data, error } = await this.supabase
      .from('keywords')
      .insert(keywords);
    if (error) throw new Error(`Failed to insert keywords: ${error.message}`);
    return data;
  }

  // Insert project categories
  async insertProjectCategories(
    categories: Database['public']['Tables']['project_categories']['Insert'][],
  ) {
    const { data, error } = await this.supabase
      .from('project_categories')
      .insert(categories);
    if (error)
      throw new Error(`Failed to insert project categories: ${error.message}`);
    return data;
  }

  // Insert projects
  async insertProjects(
    projects: Database['public']['Tables']['projects']['Insert'][],
  ) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(projects);
    if (error) throw new Error(`Failed to insert projects: ${error.message}`);
    return data;
  }

  // Insert skills
  async insertSkills(
    skills: Database['public']['Tables']['skills']['Insert'][],
  ) {
    const { data, error } = await this.supabase.from('skills').insert(skills);
    if (error) throw new Error(`Failed to insert skills: ${error.message}`);
    return data;
  }

  // Main function to process and insert the CV data
  /*   async importCvData(filePath: string) {
    try {
      const data = await this.pdfProcessingService.processPdfContent(filePath); // Retrieve JSON-structured CV data

      // Insert data by type
      const profile = data.profiles[0]; // Assuming one profile
      await this.insertProfile(profile);

      if (data.certifications)
        await this.insertCertifications(data.certifications);
      if (data.keywords) await this.insertKeywords(data.keywords);
      if (data.projectCategories)
        await this.insertProjectCategories(data.projectCategories);
      if (data.projects) await this.insertProjects(data.projects);
      if (data.skills) await this.insertSkills(data.skills);

      console.log('CV data imported successfully!');
    } catch (error) {
      console.error('Error importing CV data:', error);
    }
  } */
}
