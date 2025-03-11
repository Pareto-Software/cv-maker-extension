import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseModule } from './supabase.module.js';
import { INestApplication } from '@nestjs/common';
import { EmployeeFullDetailDTO } from './dto/employees-response.dto.js';
import validateDate from './supabase-cv-import.service.js';
import * as dotenv from 'dotenv';
import { SupabaseCvImportService } from './supabase-cv-import.service.js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { ConfigService } from '@nestjs/config';

/*describe('SupabaseController (e2e)', () => {
  let app: INestApplication;

  const mockEmployeeData: EmployeeFullDetailDTO = {
    id: 123,
    name: 'Samu Toljamo',
    title: 'Software Developer',
    description:
      'I’m a software developer with 2 years of relevant work experience but I began programming as a hobby a decade ago. Over the years, I’ve developed a solid understanding of various technologies but I’m at my strongest in backend oriented web-based projects.',
    education: {
      school: 'Tampere University',
      graduationYear: 2024,
      degree: "Bachelor's degree",
      field: 'Computer Science',
      thesis: 'Some thesis',
    },
    skills: [
      { name: 'Python', level: 3 },
      { name: 'Flask', level: 5 },
      { name: 'SQL', level: 4 },
    ],
    projects: [
      {
        name: 'Project Alpha',
        description: 'Developing a new electric bus emergency brake system',
        company: 'Omnibus',
        role: 'Scrum master',
        start_date: '2023-05-09',
        end_date: '2023-09-03',
      },
    ],
    certifications: [
      {
        name: 'SQL Monster',
        received: 'May 5th, 2023',
        valid_until: 'End of 2025',
      },
    ],
  };

  const mockSupabaseService = {
    getEmployeesFullInformation: jest.fn().mockResolvedValue(mockEmployeeData),
  };

  // just use the mockSupabaseService so it passes linter
  mockSupabaseService.getEmployeesFullInformation();

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SupabaseModule],
    }).compile();
    dotenv.config();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET employees/:first_name/:last_name`, async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?firstName=Samu&lastName=Toljamo')
      .expect(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('title');
  }, 30000);

  it(`/GET employees/:first_name/:last_name`, async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?firstName=Samu&lastName=Toljamo')
      .expect(200);

    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('title');
  });

  it(`/GET employees/skills-projects`, async () => {
    const response = await request(app.getHttpServer())
      .get('/employees/skills-projects')
      .expect(200);

    expect(response.body).toHaveProperty('employees');
    expect(Array.isArray(response.body.employees)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});*/

describe('validateDate', () => {
  it('should return the date string if valid', () => {
    expect(validateDate('2024-03-06')).toBe('2024-03-06');
    expect(validateDate('1800-10-21')).toBe('1800-10-21');
  });

  it('should return null for invalid date formats', () => {
    expect(validateDate('March 6, 2024')).toBeNull();
    expect(validateDate('06-03-2024')).toBeNull();
    expect(validateDate('2024/03/06')).toBeNull();
    expect(validateDate('20240306')).toBeNull();
  });

  it('should return null for possible unexpected values', () => {
    expect(validateDate(null)).toBeNull();
    expect(validateDate('null')).toBeNull();
    expect(validateDate(undefined)).toBeNull();
    expect(validateDate(12345)).toBeNull();
    expect(validateDate({})).toBeNull();
    expect(validateDate([])).toBeNull();
  });

  it('should return null for an empty string', () => {
    expect(validateDate('')).toBeNull();
  });

  it('should return null for an invalid date', () => {
    expect(validateDate('2024-02-30')).toBeNull();
    expect(validateDate('2024-13-01')).toBeNull();
  });
});

describe('SupabaseCvImportService', () => {
  let service: SupabaseCvImportService;
  let supabaseClientProvider: SupabaseClientProvider;

  beforeEach(() => {
    dotenv.config();
    process.env.SUPABASE_URL = process.env.SUPABASE_URL;
    process.env.SUPABASE_KEY = process.env.SUPABASE_KEY;
    const configService = new ConfigService();
    supabaseClientProvider = new SupabaseClientProvider(configService);
    service = new SupabaseCvImportService(supabaseClientProvider);
  });

  describe('insertProjects', () => {
    it('should insert projects and return true', async () => {
      const mockProjects = [
        {
          name: 'Project Alpha',
          description: 'Description Alpha',
          company: 'Company Alpha',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          role: 'Developer',
          project_url: 'http://example.com/alpha',
          image_url: 'http://example.com/alpha.jpg',
          keywords: 'Next.JS, KissaMiau',
          project_category: 120,
        },
      ];

      const mockCategoryConnections = [{ row_id: 1, id: 1 }];
      const user_id = '4ae9517f-d71d-4c86-a32d-57066f78900b';
      const cv_id = '006f73a1-1e0e-4482-8d02-4bfa62425dfc';

      const result = await service.insertProjects(
        mockProjects,
        mockCategoryConnections,
        user_id,
        cv_id,
      );

      expect(result).toBe(true);
    });
  });
});
