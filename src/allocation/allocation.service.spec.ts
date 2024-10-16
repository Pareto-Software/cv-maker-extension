import { Test, TestingModule } from '@nestjs/testing';
import { AllocationService } from './allocation.service';
import { SheetService } from '../sheet/sheet.service';
import { SheetDataDTO } from 'src/sheet/dtos';
import { SheetsClientProvider } from 'src/sheet/sheets-client.provider';
const sampleData: SheetDataDTO = {
  rows: [
    {
      capacity: 0.8,
      name: 'Test person',
      cells: [
        {
          reservationPercentage: 0.8,
          year: 2015,
          month: 'May',
          status: 'unavailable',
        },
        {
          reservationPercentage: 0,
          year: 2024,
          month: 'Jun',
          status: 'available',
        },
      ],
    },
    {
      capacity: 1,
      name: 'Test person2',
      cells: [
        {
          reservationPercentage: 1,
          year: 2024,
          month: 'May',
          status: 'unavailable',
        },
        {
          reservationPercentage: 1,
          year: 2024,
          month: 'Jun',
          status: 'unavailable',
        },
      ],
    },
    // This person has future availability
    {
      capacity: 1,
      name: 'Test person3',
      cells: [
        {
          reservationPercentage: 0,
          year: 2025,
          month: 'May',
          status: 'available',
        },
        {
          reservationPercentage: 0,
          year: 2025,
          month: 'Jun',
          status: 'available',
        },
      ],
    },
    {
      capacity: 1,
      name: 'Test person3',
      cells: [
        {
          reservationPercentage: 0,
          year: 2025,
          month: 'May',
          status: 'flexible_start',
        },
        {
          reservationPercentage: 0,
          year: 2025,
          month: 'Jun',
          status: 'flexible_start',
        },
      ],
    },
  ],
};
describe('AllocationService', () => {
  let service: AllocationService;
  let sheetService: SheetService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllocationService, SheetService, SheetsClientProvider],
    }).compile();
    service = module.get<AllocationService>(AllocationService);
    sheetService = module.get<SheetService>(SheetService);
    jest.spyOn(sheetService, 'getSheetData').mockResolvedValue(sampleData);
  });
  it('should return Test person as first name', () => {
    expect(service).toBeDefined();
  });
  it('should return sample data', async () => {
    expect(await sheetService.getSheetData("access_token")).toEqual(sampleData);
  });
});
