import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseModule } from './supabase.module';
import { INestApplication } from '@nestjs/common';
import * as dotenv from 'dotenv';

describe('SupabaseController (e2e)', () => {
  let app: INestApplication;

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
    console.log('Response for /GET employees:', response.body);
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
});
