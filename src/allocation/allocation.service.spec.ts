import { Test, TestingModule } from '@nestjs/testing';
import { AllocationService, AllocationResponseDTO } from './allocation.service';
import { SheetService } from '../sheet/sheet.service';
import { SheetDataDTO } from '../sheet/dtos';
import { SheetsClientProvider } from '../sheet/sheets-client.provider';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const dummyAccessToken = 'dummy-access-token';
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
      providers: [
        AllocationService,
        SheetService,
        SheetsClientProvider,
        ConfigService,
      ],
    }).compile();
    service = module.get<AllocationService>(AllocationService);
    sheetService = module.get<SheetService>(SheetService);
    jest.spyOn(sheetService, 'getSheetData').mockResolvedValue(sampleData);
  });

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        CLIENT_ID: 'dummy-client-id',
        CLIENT_SECRET: 'dummy-client-secret',
        REDIRECT_URL: 'http://localhost/redirect',
        SPREADSHEET_ID: 'dummy-spreadsheet-id',
        GOOGLE_API_KEY: 'dummy-api-key',
        AUTH_METHOD: 'api_key',
      };
      return config[key];
    }),
  };
  it('should return Test person as first name', () => {
    expect(service).toBeDefined();
  });
  it('should return sample data', async () => {
    expect(await sheetService.getSheetData('access_token')).toEqual(sampleData);
  });

  it('should return allocation data for an existing employee', async () => {
    const name = 'Test person';
    const expectedResult: AllocationResponseDTO = {
      name: 'Test person',
      capacity: 0.8,
      data: {
        '2015': {
          May: {
            reservationPercentage: 0.8,
            status: 'unavailable',
          },
        },
        '2024': {
          Jun: {
            reservationPercentage: 0,
            status: 'available',
          },
        },
      },
    };

    const result = await service.getAllocationByName(name, dummyAccessToken);

    expect(result).toEqual(expectedResult);
  });

  describe('getAllEmployeeNames', () => {
    it('should return unique employee names', async () => {
      const expectedNames = ['Test person', 'Test person2', 'Test person3'];

      const result = await service.getAllEmployeeNames(dummyAccessToken);

      expect(result).toEqual(expectedNames);
      expect(sheetService.getSheetData).toHaveBeenCalledWith(dummyAccessToken);
    });

    it('should throw an error if getSheetData fails', async () => {
      jest
        .spyOn(sheetService, 'getSheetData')
        .mockRejectedValue(new Error('Failed to fetch data'));

      await expect(
        service.getAllEmployeeNames(dummyAccessToken),
      ).rejects.toThrow('Failed to fetch employee names');
    });
  });

  describe('getAllocationsByMonthYear', () => {
    it('should return allocations for a specific month and year', async () => {
      const year = 2024;
      const month = 'Jun';

      const expectedResponse = {
        year,
        month,
        allocations: {
          'Test person': {
            value: 0,
            status: 'available',
          },
          'Test person2': {
            value: 1,
            status: 'unavailable',
          },
        },
      };

      const result = await service.getAllocationsByMonthYear(
        year,
        month,
        dummyAccessToken,
      );

      expect(result).toEqual(expectedResponse);
      expect(sheetService.getSheetData).toHaveBeenCalledWith(dummyAccessToken);
    });

    it('should return allocations regardless of month case sensitivity', async () => {
      const year = 2024;
      const month = 'jun'; // Lowercase month

      const expectedResponse = {
        year,
        month,
        allocations: {
          'Test person': {
            value: 0,
            status: 'available',
          },
          'Test person2': {
            value: 1,
            status: 'unavailable',
          },
        },
      };

      const result = await service.getAllocationsByMonthYear(
        year,
        month,
        dummyAccessToken,
      );

      expect(result).toEqual(expectedResponse);
      expect(sheetService.getSheetData).toHaveBeenCalledWith(dummyAccessToken);
    });

    it('should throw NotFoundException if no data is found for the given month and year', async () => {
      const year = 2030;
      const month = 'Dec';

      await expect(
        service.getAllocationsByMonthYear(year, month, dummyAccessToken),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle errors from sheetService.getSheetData', async () => {
      sheetService.getSheetData = jest
        .fn()
        .mockRejectedValue(new Error('Sheet service error'));

      const year = 2024;
      const month = 'Jun';

      await expect(
        service.getAllocationsByMonthYear(year, month, dummyAccessToken),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
