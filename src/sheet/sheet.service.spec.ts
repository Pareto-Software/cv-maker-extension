import { Test, TestingModule } from '@nestjs/testing';
import { SheetService } from './sheet.service';
import { ConfigService } from '@nestjs/config';

describe('SheetService', () => {
  let service: SheetService;

    beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
          providers: [
            SheetService,
            {
              provide: ConfigService,
              useValue: {
                // Mock methods if necessary
              },
            },
          ],
        }).compile();

        service = module.get<SheetService>(SheetService);
      });
    it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
