// cv-import.service.ts
import { Injectable } from '@nestjs/common';
import { DocumentParserService } from './service/documentParser.service.js';
import { OpenAiAPIService } from './service/openai.service.js';
import { SupabaseCvImportService } from '../supabase/supabase-cv-import.service.js';
import path from 'path';
import * as fs from 'fs';

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
    saveToUser: string
): Promise<boolean> {
    var dataString: string = '';

    if (files.length > 10 || files.length == 0) {
      console.error('1-10 files allowed, aborting');
      return false;
    }

    for (let file of files) {
      if(file.buffer.length == 0) {
        console.error('File buffer was empty on %s, ignoring', file.filename);
        continue;
      }

      if(file.size > 5 * 1024 * 1024) {
        console.error('Maximum file size is 5MB, ignoring %s', file.filename);
        continue;
      }

      if(file.mimetype !== "application/pdf") {
        console.error("Only pdf files allowed for now, ignoring %s", file.filename);
        continue;
      }

      // TODO implement choose correct document processor
      dataString += await this.documentParserService.parsePdfFile(file);      
    }  

    if (dataString.length < 10) {
      console.error('Length of a string created from parsed files was under 10 chars, aborting.')
      return false;
    }

    const structuredJson = await this.openAiAPIService.textToStructuredJSON(dataString);
    
    // happy path
    if (structuredJson) {
      const result = await this._saveJsonAsCv(
        structuredJson,
        saveToUser
      );
      if (result) {
        return true;
      }          
    } 

    console.error("Failed to save data");
    return false;
    
  }
  

  async _saveJsonAsCv(
    json: Record<string, any>,
    user_id: string
  ): Promise<boolean> {
    // Save a new cv to user and get a new cv id as return value
    const cv_id = await this.supabaseCvImportService.insertCv(user_id);

    if (cv_id != null) {
      await this.supabaseCvImportService.updateProfile(json.profiles[0], user_id);
      await this.supabaseCvImportService.insertSkills(json.skills, user_id, cv_id);  
      await this.supabaseCvImportService.insertCertifications(json.certifications, user_id, cv_id);     
      const categories = await this.supabaseCvImportService.insertProjectCategories(json.project_categories, user_id, cv_id);
      if (categories != null) {
        await this.supabaseCvImportService.insertProjects(json.projects, categories, user_id, cv_id);
      }
      return true;
    }
 
    console.error("Cv_id was null when trying to create a new cv at saveJsonAsCv");
    return false;
  }
}
