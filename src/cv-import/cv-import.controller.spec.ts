import { Test, TestingModule } from '@nestjs/testing';
import { CvImportController } from './cv-import.controller';

describe('CvImportController', () => {
  let controller: CvImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvImportController],
    }).compile();

    controller = module.get<CvImportController>(CvImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
