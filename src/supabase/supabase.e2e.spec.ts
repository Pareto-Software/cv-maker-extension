/*import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseModule } from './supabase.module.js';
import { INestApplication } from '@nestjs/common';
import { EmployeeFullDetailDTO } from './dto/employees-response.dto.js';
import * as dotenv from 'dotenv';
import { SupabaseCvImportService } from './supabase-cv-import.service.js';
import { SupabaseClientProvider } from './supabase-client.provider.js';
import { ConfigService } from '@nestjs/config';*/

import { validateDate, processKeywords } from './supabase-cv-import.service.js';

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

describe('processKeywords', () => {
  it('should identify existing keywords correctly', () => {
    const projectKeywords = ['React', 'Node.js', 'GraphQL'];
    const existingKeywords = [
      { id: 1, name: 'react' },
      { id: 2, name: 'node.js' },
    ];

    const result = processKeywords(projectKeywords, existingKeywords);

    expect(result.existingKeywordIds).toEqual([1, 2]);
    expect(result.newKeywords).toEqual(['GraphQL']);
  });

  it('should handle case insensitivity and special characters', () => {
    const projectKeywords = ['React', 'NodeJS', 'GraphQL'];
    const existingKeywords = [
      { id: 1, name: 'react' },
      { id: 2, name: 'node.js' },
    ];

    const result = processKeywords(projectKeywords, existingKeywords);

    expect(result.existingKeywordIds).toEqual([1, 2]);
    expect(result.newKeywords).toEqual(['GraphQL']);
  });

  it('should detect all keywords as new when none exist', () => {
    const projectKeywords = ['TypeScript', 'Docker', 'Kubernetes'];
    const existingKeywords: { id: number; name: string }[] = [];

    const result = processKeywords(projectKeywords, existingKeywords);

    expect(result.existingKeywordIds).toEqual([]);
    expect(result.newKeywords).toEqual(['TypeScript', 'Docker', 'Kubernetes']);
  });

  it('should return an empty list when no keywords are provided', () => {
    const projectKeywords: string[] = [];
    const existingKeywords = [{ id: 1, name: 'react' }];

    const result = processKeywords(projectKeywords, existingKeywords);

    expect(result.existingKeywordIds).toEqual([]);
    expect(result.newKeywords).toEqual([]);
  });
});
