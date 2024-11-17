import { Test, TestingModule } from '@nestjs/testing';
import { CvImportService } from './cv-import.service';
import { SupabaseCvImportService } from '../supabase/supabase-cv-import.service';
import { DocumentParserService } from './service/documentParser.service';
import { OpenAiAPIService } from './service/openai.service';
import * as fs from 'fs';
import * as path from 'path';

// Unit tests for service
describe('CvImportService', () => {
  let service: CvImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvImportService],
    }).compile();

    service = module.get<CvImportService>(CvImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CvImportService', () => {
    let service: CvImportService;
    let supabaseCvImportService: SupabaseCvImportService;
    let documentParserService: DocumentParserService;
    let openAiAPIService: OpenAiAPIService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CvImportService,
          {
            provide: SupabaseCvImportService,
            useValue: {
              insertCv: jest.fn(),
              updateProfile: jest.fn(),
              insertSkills: jest.fn(),
              insertCertifications: jest.fn(),
              insertProjectCategories: jest.fn(),
              insertProjects: jest.fn(),
            },
          },
          {
            provide: DocumentParserService,
            useValue: {
              parsePdfFile: jest.fn(),
            },
          },
          {
            provide: OpenAiAPIService,
            useValue: {
              textToStructuredJSON: jest.fn(),
            },
          },
        ],
      }).compile();

      service = module.get<CvImportService>(CvImportService);
      supabaseCvImportService = module.get<SupabaseCvImportService>(SupabaseCvImportService);
      documentParserService = module.get<DocumentParserService>(DocumentParserService);
      openAiAPIService = module.get<OpenAiAPIService>(OpenAiAPIService);
    });

   
    describe('_saveJsonAsCv', () => {
      it('should save JSON as CV successfully', async () => {
        // Step 1: Read and parse the JSON file
        const jsonFilePath = path.resolve(__dirname, '../../test/test_data/test.json');
        const jsonString = fs.readFileSync(jsonFilePath, 'utf-8');
        const json = JSON.parse(jsonString); 
        const user_id = '9ef9c361-e9be-4c8c-b9c5-a20c813d4b18';
        await service._saveJsonAsCv(json, user_id);

      });
    });
  });
});
