import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { Database } from './database.types.js';
import { z } from 'zod';

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
    const currentTimestamp = new Date().toISOString().slice(0, 16);

    const { data, error } = await this.supabase
      .from('cvs')
      .insert({
        title: `AI Generated CV - ${currentTimestamp}`,
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
        received: validateDate(key.received),
        valid_until: validateDate(key.valid_until),
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
      end_date: validateDate(category.end_date),
      start_date: validateDate(category.start_date),
      description: category.description,
      user_id: user_id,
      cv_id: cv_id,
    }));

    const { data: insertedRows, error } = await this.supabase
      .from('project_categories')
      .insert(data)
      .select();

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
        start_date: validateDate(project.start_date),
        end_date: validateDate(project.end_date),
        role: project.role,
        project_url: project.project_url,
        image_url: project.image_url,
        user_id: user_id,
        cv_id: cv_id,
        project_category: match ? match.row_id : null,
      };
    });

    const { data: insertedProjects, error } = await this.supabase
      .from('projects')
      .insert(data)
      .select();
    if (error) throw new Error(`Failed to insert projects: ${error.message}`);

    const { data: existingKeywords, error: keywordFetchError } =
      await this.supabase.from('keywords').select('id, name');

    if (keywordFetchError) {
      throw new Error(
        `Failed to fetch existing keywords: ${keywordFetchError.message}`,
      );
    }

    for (let i = 0; i < projects.length; i++) {
      const projectKeywords = projects[i].keywords ?? [];
      const projectId = insertedProjects[i]?.id;

      if (!projectId || projectKeywords.length === 0) continue;

      const { existingKeywordIds, newKeywords } = processKeywords(
        projectKeywords,
        existingKeywords || [],
      );

      // Insert new keywords and update keyword mapping
      const newKeywordIds: number[] = [];

      if (newKeywords.length > 0) {
        const { data: insertedKeywords, error: keywordInsertError } =
          await this.supabase
            .from('keywords')
            .insert(newKeywords.map((name) => ({ name })))
            .select('id');

        if (keywordInsertError) {
          console.error(
            `Failed to insert new keywords: ${keywordInsertError.message}`,
          );
        } else {
          newKeywordIds.push(...insertedKeywords.map((keyword) => keyword.id));
        }
      }

      // Link keywords to projects
      const keywordIds = [...existingKeywordIds, ...newKeywordIds];

      if (keywordIds.length > 0) {
        const keywordData = keywordIds.map((keywordId) => ({
          project_id: projectId,
          keyword_id: keywordId,
        }));

        await this.supabase.from('project_keywords').insert(keywordData);
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

export function processKeywords(
  projectKeywords: string | string[],
  existingKeywords: { id: number; name: string }[],
) {
  if (typeof projectKeywords === 'string') {
    projectKeywords = projectKeywords.split(',');
  }
  const keywordList = Array.isArray(projectKeywords) ? projectKeywords : [];

  // Keep two lists: one for comparison, one for inserting original values
  const originalKeywords = keywordList.map((keyword) => keyword.trim());
  const trimmedKeywords = keywordList.map((keyword) =>
    keyword.toLowerCase().replace(/[^a-z0-9+#]/g, ''),
  );

  const keywordValues = new Map(
    trimmedKeywords.map((keyword, index) => [keyword, originalKeywords[index]]),
  );

  const existingKeywordMap = new Map(
    existingKeywords.map((row) => [
      row.name.toLowerCase().replace(/[^a-z0-9+#]/g, ''),
      row.id,
    ]),
  );

  const newKeywords: string[] = [];
  const existingKeywordIds: number[] = [];

  for (const keyword of keywordValues.keys()) {
    const keywordId = existingKeywordMap.get(keyword);

    if (keywordId) {
      existingKeywordIds.push(keywordId);
    } else {
      newKeywords.push(keywordValues.get(keyword)!);
    }
  }

  return { existingKeywordIds, newKeywords };
}

export function validateDate(data: unknown): string | null {
  const dateStringOrNullSchema = z.string().date();
  try {
    dateStringOrNullSchema.parse(data);
    return data as string;
  } catch (error) {
    console.error(
      `Invalid format: "${data}". Expected null or date like: YYYY-MM-DD. Defaulted to null.`,
    );
    return null;
  }
}
