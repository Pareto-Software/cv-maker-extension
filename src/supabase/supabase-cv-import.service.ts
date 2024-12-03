import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { Database } from './database.types.js';

@Injectable()
export class SupabaseCvImportService {
  private supabase: SupabaseClient<Database>;

  constructor(private readonly supabaseClientProvider: SupabaseClientProvider) {
    this.supabase = this.supabaseClientProvider.getClient();
  }

  // Insert profile
  async updateProfile(
    profile: Database['public']['Tables']['profiles']['Insert'],
    user_id: string,
  ): Promise<string | null> {
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
      console.error(`Failed to update profile: ${error.message}`);
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
      console.error(`Failed to insert CV: ${error.message}`);
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
    const data = certifications.map(
      (key: { name: any; received: any; valid_until: any }) => ({
        name: key.name,
        received: key.received,
        valid_until: key.valid_until,
        user_id: user_id,
        cv_id: cv_id,
      }),
    );
    const { error } = await this.supabase.from('certifications').insert(data);
    if (error)
      throw new Error(`Failed to insert certifications: ${error.message}`);
    return false;
  }

  async insertProjectCategories(
    projectCategories: Record<string, any>[],
    user_id: string,
    cv_id: string,
  ): Promise<{ row_id: number; id: any }[] | null> {
    const data = projectCategories.map((category) => ({
      title: category.title,
      end_date: category.end_date,
      start_date: category.start_date,
      description: category.description,
      user_id: user_id,
      cv_id: cv_id,
    }));

    const { data: insertedRows, error } = await this.supabase
      .from('project_categories')
      .insert(data)
      .select();
    console.log('inserted');
    if (error)
      throw new Error(`Failed to insert project categories: ${error.message}`);
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
    const data = projects.map((project) => {
      // Find the matching row_id for the current project's category_id
      const match = categoryConnections.find(
        (connection) => connection.id === project.project_category,
      );

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

    const { data: insertedProjects, error } = await this.supabase
      .from('projects')
      .insert(data)
      .select();
    if (error) throw new Error(`Failed to insert projects: ${error.message}`);

    for (let i = 0; i < projects.length; i++) {
      // Ensure projectKeywords is an array of words
      let projectKeywords = projects[i].keywords;

      if (typeof projectKeywords === 'string') {
        // Split keywords by commas and trim extra spaces
        projectKeywords = projectKeywords
          .split(',')
          .map((keyword) => keyword.trim());
      }

      const projectId = insertedProjects[i]?.id;

      if (projectId && projectKeywords && projectKeywords.length > 0) {
        const keywordIds: number[] = [];

        for (const keyword of projectKeywords) {
          try {
            // Check if the keyword already exists in the 'keywords' table
            const { data: existingKeywords, error: keywordFetchError } =
              await this.supabase
                .from('keywords')
                .select('id')
                .eq('name', keyword);

            if (keywordFetchError) {
              throw new Error(`Failed to fetch keyword "${keyword}"`);
            }

            let keywordId;

            if (existingKeywords && existingKeywords.length > 0) {
              // Use the first match if duplicates exist
              keywordId = existingKeywords[0].id;
            } else {
              // If the keyword doesn't exist, insert it and retrieve its id
              const { data: newKeyword, error: keywordInsertError } =
                await this.supabase
                  .from('keywords')
                  .insert({ name: keyword })
                  .select('id')
                  .single();

              if (keywordInsertError) {
                throw new Error(`Failed to insert new keyword "${keyword}"`);
              }
              keywordId = newKeyword.id;
            }
            // Add the keyword ID to the list
            keywordIds.push(keywordId);
          } catch (error) {
            console.error(
              `Error processing keyword "${keyword}" for project #${i + 1}:`,
              error,
            );
          }
        }

        try {
          // Now, insert all keyword IDs for the current project into 'project_keywords'
          const keywordData = keywordIds.map((keywordId) => ({
            project_id: projectId,
            keyword_id: keywordId,
          }));

          const { error: projectKeywordsInsertError } = await this.supabase
            .from('project_keywords')
            .insert(keywordData);

          if (projectKeywordsInsertError) {
            console.error(
              `Error inserting keywords into 'project_keywords' for project ID ${projectId}:`,
              projectKeywordsInsertError.message,
            );
            throw new Error(
              `Failed to insert project keywords for project ID ${projectId}`,
            );
          }
        } catch (error) {
          console.error(
            `Error inserting keywords into 'project_keywords' for project #${i + 1}:`,
            error,
          );
        }
      } else {
        console.warn(
          `No valid keywords or project ID for project #${i + 1}. Skipping...`,
        );
      }
    }
    return true;
  }

  async insertSkills(
    skills: Record<string, any>[],
    user_id: string,
    cv_id: string,
  ): Promise<boolean | null> {
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
}
