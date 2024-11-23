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
  ): Promise<{ row_id: number; id: any }[] | null> {
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
  
    const { data: insertedRows, error } = await this.supabase.from('project_categories').insert(data).select();
    if (error) throw new Error(`Failed to insert project categories: ${error.message}`);
    return insertedRows.map((row, index) => ({
      row_id: row.id, // Database-assigned ID for the row
      id: projectCategories[index]?.id || null, // Original category ID from the input
    }));
  }
  
  

  async insertProjects(
    projects: Record<string, any>[],
    categoryConnections: { row_id: number; id: any }[],
    user_id: string,
    cv_id: string,
  ): Promise<boolean | null> {
    console.log("PROJECTS:");
    console.log(projects);
    const data = projects.map((project) => {
      // Find the matching row_id for the current project's category_id
      const match = categoryConnections.find(connection => connection.id === project.project_category);
  
      return {
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
        project_category: match ? match.row_id : null, // Use row_id or null if no match found
      };
    });

    console.log("Mapped project data:", data);
  
    const { data: insertedProjects, error } = await this.supabase
    .from("projects")
    .insert(data)
    .select();
    if (error) throw new Error(`Failed to insert projects: ${error.message}`);

    for (let i = 0; i < projects.length; i++) {
      // Ensure projectKeywords is an array of words
      let projectKeywords = projects[i].keywords;
      console.log(`Processing project #${i + 1} with raw keywords:`, projectKeywords);
    
      if (typeof projectKeywords === 'string') {
        // Split keywords by commas and trim extra spaces
        projectKeywords = projectKeywords.split(',').map((keyword) => keyword.trim());
      }
    
      console.log(`Parsed keywords for project #${i + 1}:`, projectKeywords);
    
      const projectId = insertedProjects[i]?.id;
      console.log(`Project ID for project #${i + 1}:`, projectId);
    
      if (projectId && projectKeywords && projectKeywords.length > 0) {
        const keywordIds: number[] = [];
        console.log(`Starting to process keywords for project #${i + 1}...`);
    
        for (const keyword of projectKeywords) {
          try {
            console.log(`Checking keyword: "${keyword}"`);
        
            // Check if the keyword already exists in the 'keywords' table
            const { data: existingKeywords, error: keywordFetchError } = await this.supabase
              .from('keywords')
              .select('id')
              .eq('name', keyword);
        
            if (keywordFetchError) {
              console.error(`Error fetching keyword "${keyword}":`, keywordFetchError.message);
              throw new Error(`Failed to fetch keyword "${keyword}"`);
            }
        
            let keywordId;
        
            if (existingKeywords && existingKeywords.length > 0) {
              // Use the first match if duplicates exist
              keywordId = existingKeywords[0].id;
              console.log(`Keyword "${keyword}" exists with ID: ${keywordId}`);
            } else {
              // If the keyword doesn't exist, insert it and retrieve its id
              console.log(`Keyword "${keyword}" does not exist. Inserting it into the database...`);
              const { data: newKeyword, error: keywordInsertError } = await this.supabase
                .from('keywords')
                .insert({ name: keyword })
                .select('id')
                .single();
        
              if (keywordInsertError) {
                console.error(`Error inserting keyword "${keyword}":`, keywordInsertError.message);
                throw new Error(`Failed to insert new keyword "${keyword}"`);
              }
        
              keywordId = newKeyword.id;
              console.log(`Inserted keyword "${keyword}" with new ID: ${keywordId}`);
            }
        
            // Add the keyword ID to the list
            keywordIds.push(keywordId);
          } catch (error) {
            console.error(`Error processing keyword "${keyword}" for project #${i + 1}:`, error);
          }
        }        
    
        try {
          // Now, insert all keyword IDs for the current project into 'project_keywords'
          const keywordData = keywordIds.map((keywordId) => ({
            project_id: projectId,
            keyword_id: keywordId,
          }));
    
          console.log(`Inserting keywords for project #${i + 1}:`, keywordData);
    
          const { error: projectKeywordsInsertError } = await this.supabase
            .from('project_keywords')
            .insert(keywordData);
    
          if (projectKeywordsInsertError) {
            console.error(
              `Error inserting keywords into 'project_keywords' for project ID ${projectId}:`,
              projectKeywordsInsertError.message
            );
            throw new Error(`Failed to insert project keywords for project ID ${projectId}`);
          }
    
          console.log(`Successfully inserted keywords for project #${i + 1}.`);
        } catch (error) {
          console.error(`Error inserting keywords into 'project_keywords' for project #${i + 1}:`, error);
        }
      } else {
        console.warn(`No valid keywords or project ID for project #${i + 1}. Skipping...`);
      }
    }
    
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
