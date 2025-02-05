// cv-import.service.ts
import { Injectable } from '@nestjs/common';
import { DocumentParserService } from './service/documentParser.service.js';
import { OpenAiAPIService } from './service/openai.service.js';
import { SupabaseCvImportService } from '../supabase/supabase-cv-import.service.js';

// Currently supported filetypes, should be the same as in cvmaker
enum FileType {
  PDF = 'application/pdf',
  Docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

// Implements business logic and data handling.
@Injectable()
export class CvImportService {
  constructor(
    private readonly supabaseCvImportService: SupabaseCvImportService,
    private readonly documentParserService: DocumentParserService,
    private readonly openAiAPIService: OpenAiAPIService,
  ) {}

  async processFiles(
    files: Express.Multer.File[],
    saveToUser: string,
  ): Promise<boolean> {
    let dataString = '';

    if (files.length > 10 || files.length === 0) {
      console.error('1-10 files allowed, aborting');
      return false;
    }

    for (const file of files) {
      if (file.buffer.length === 0) {
        console.error('File buffer was empty on %s, ignoring', file.filename);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.error('Maximum file size is 5MB, ignoring %s', file.filename);
        continue;
      }

      if (!Object.values(FileType).includes(file.mimetype as FileType)) {
        console.error(
          'Only pdf & docx files allowed for now, ignoring %s',
          file.filename,
        );
        continue;
      }

      switch (file.mimetype) {
        case FileType.PDF:
          dataString += await this.documentParserService.parsePdfFile(file);
          break;
        case FileType.Docx:
          dataString += await this.documentParserService.parseDocxFile(file);
          break;
        default:
          break;
      }
    }

    if (dataString.length < 10) {
      console.error(
        'Length of a string created from parsed files was under 10 chars, aborting.',
      );
      return false;
    }

    const structuredJson =
      await this.openAiAPIService.textToStructuredJSON(dataString);

    // happy path
    if (structuredJson) {
      const result = await this._saveJsonAsCv(structuredJson, saveToUser);
      if (result) {
        return true;
      }
    }

    console.error('Failed to save data');
    return false;
  }

  private async _saveJsonAsCv(
    json: Record<string, any>,
    user_id: string,
  ): Promise<boolean> {
    try {
      // Save a new CV to user and get a new cv_id as return value
      const cv_id = await this.supabaseCvImportService.insertCv(user_id);

      if (!cv_id) {
        console.error('Cv_id was null when trying to create a new CV');
        return false;
      }

      const profileData = json.profiles[0];

      if (
        profileData?.social_media_links &&
        typeof profileData.social_media_links === 'string'
      ) {
        profileData.social_media_links = profileData.social_media_links
          .split(',')
          .map((link: string) => link.trim());
      }

      try {
        await this.supabaseCvImportService.updateProfile(profileData, user_id);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }

      try {
        await this.supabaseCvImportService.insertSkills(
          json.skills,
          user_id,
          cv_id,
        );
      } catch (error) {
        console.error('Failed to insert skills:', error);
      }

      try {
        await this.supabaseCvImportService.insertCertifications(
          json.certifications,
          user_id,
          cv_id,
        );
      } catch (error) {
        console.error('Failed to insert certifications:', error);
      }

      try {
        const categories =
          await this.supabaseCvImportService.insertProjectCategories(
            json.project_categories,
            user_id,
            cv_id,
          );

        if (categories) {
          try {
            await this.supabaseCvImportService.insertProjects(
              json.projects,
              categories,
              user_id,
              cv_id,
            );
          } catch (error) {
            console.error('Failed to insert projects:', error);
          }
        }
      } catch (error) {
        console.error('Failed to insert project categories:', error);
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in _saveJsonAsCv:', error);
      return false;
    }
  }
}
