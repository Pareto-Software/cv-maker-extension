import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthGuard } from '../src/oauth2/auth.guard';
import { SheetService } from '../src/sheet/sheet.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockAuthGuard = {
      canActivate: jest.fn(() => true),
      getUserGroups: jest.fn(() => ['test-group']),
    };

    const mockSheetService = {
      getSheetData: jest.fn().mockResolvedValue({ rows: [] }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideProvider(SheetService)
      .useValue(mockSheetService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'UP',
      uptime: expect.any(Number),
    });
  });
});
