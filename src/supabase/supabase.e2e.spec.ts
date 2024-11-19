import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseModule } from './supabase.module';
import { SupabaseService } from './supabase.service';
import { INestApplication } from '@nestjs/common';
import {
  EmployeeFullDetailDTO,
  EmployeeDTO,
} from './dto/employees-response.dto';

describe('SupabaseController (e2e)', () => {
  let app: INestApplication;

  const mockEmployeeData: EmployeeFullDetailDTO = {
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

  const mockEmployeeSkillsProjectsData: EmployeeDTO[] = [
    {
      name: 'John Doe',
      skills: ['TypeScript', 'NestJS'],
      projects: [
        {
          name: 'Project X',
          keywords: ['backend', 'typescript'],
        },
      ],
      certifications: ['Certified Backend Developer'],
    },
  ]; 

  const mockSupabaseService = {
    getEmployeesFullInformation: jest.fn().mockResolvedValue(mockEmployeeData),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SupabaseModule],
    })
      .overrideProvider(SupabaseService)
      .useValue(mockSupabaseService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });


  it(`/GET employees/:first_name/:last_name`, async () => {
    const response = await request(app.getHttpServer())
      .get('/employees?firstName=Samu&lastName=Toljamo')
      .expect(200);

    expect(response.body).toEqual(mockEmployeeData);
    console.log('Response for /GET employees:', response.body);
  });

  it(`/GET employees/skills-projects`, async () => {
    const response = await request(app.getHttpServer())
      .get('/employees/skills-projects')
      .expect(200);

    expect(response.body).toEqual({
      employees: mockEmployeeSkillsProjectsData,
    });
    console.log('Response for /GET employees/skills-projects:', response.body);
  });

  afterAll(async () => {
    await app.close();
  });
});
