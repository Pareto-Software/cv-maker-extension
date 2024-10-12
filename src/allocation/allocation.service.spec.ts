import { Test, TestingModule } from '@nestjs/testing';
import { AllocationService } from './allocation.service';
import { SheetService } from '../sheet/sheet.service';

describe('AllocationService', () => {
  let service: AllocationService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sheetService: SheetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllocationService, SheetService],
    }).compile();

    service = module.get<AllocationService>(AllocationService);
    sheetService = module.get<SheetService>(SheetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
