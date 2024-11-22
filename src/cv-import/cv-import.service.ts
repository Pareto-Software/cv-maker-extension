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

  async _testProcessFiles(): Promise<boolean> {  
    console.log('running test save func');
    try {  
    const jsonFilePath = path.resolve('test/test_data/test.json');
    const jsonString = fs.readFileSync(jsonFilePath, 'utf-8');
    const json = JSON.parse(jsonString); 
    // console.log(json);
    const user_id = '9ef9c361-e9be-4c8c-b9c5-a20c813d4b18';


    return this._saveJsonAsCv(json, user_id);
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  async processFiles(
    files: Express.Multer.File[],
    saveToUser: string
): Promise<boolean> {
    //return this._testProcessFiles();
    var dataString: string = '';
    for (let file of files) {
      // TODO implementvalidate files

      // TODO implement choose correct document processor
      dataString += await this.documentParserService.parsePdfFile(file);      
    }  

    const structuredJson = await this.openAiAPIService.textToStructuredJSON(dataString);
    
    // happy path
    if (structuredJson) {
      const result = await this._saveJsonAsCv(
        structuredJson,
        saveToUser
      );
      if (result) {
        console.log("Data saved successfully");
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
    console.log('saving new cv');
    const cv_id = await this.supabaseCvImportService.insertCv(user_id);
    console.log('cv id: ' + cv_id);    

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
 
    console.log("Cv_id was null when trying to create a new cv at saveJsonAsCv");
    return false;
  }
}
