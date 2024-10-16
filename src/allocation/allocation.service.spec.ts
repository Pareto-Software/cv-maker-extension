import { Test, TestingModule } from '@nestjs/testing';
import { AllocationService, AllocationResponseDTO } from './allocation.service';
import { SheetService } from '../sheet/sheet.service';
import { SheetDataDTO } from '../sheet/dtos';
import { SheetsClientProvider } from '../sheet/sheets-client.provider';
import { ConfigService } from '@nestjs/config';

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

const sampleDataForFuture: SheetDataDTO = {
  rows: [
    {
      capacity: 0.8,
      name: 'Test person',
      cells: [
        {
          reservationPercentage: 0.8,
          year: new Date().getFullYear() - 2,
          month: 'May',
          status: 'unavailable',
        },
        {
          reservationPercentage: 0,
          year: new Date().getFullYear() + 2,
          month: 'Jun',
          status: 'available',
        },
        {
          reservationPercentage: 0,
          year: new Date().getFullYear() + 2,
          month: 'Jun',
          status: 'flexible_start',
        },
        {
          reservationPercentage: 0.8,
          year: new Date().getFullYear() + 2,
          month: 'Jun',
          status: 'unavailable',
        },
      ],
    },
  ],
};

describe('AllocationService', () => {
  let sheetService: SheetService;
  let service: AllocationService;
  beforeEach(async () => {
    sheetService = new SheetService(
      new SheetsClientProvider(
        new ConfigService({
          CLIENT_ID: 'dummy-client-id',
          CLIENT_SECRET: 'dummy-client-secret',
          REDIRECT_URL: 'http://localhost/redirect',
          SPREADSHEET_ID: 'dummy-spreadsheet-id',
          GOOGLE_API_KEY: 'dummy-api-key',
          AUTH_METHOD: 'api_key',
        }),
      ),
    );
    service = new AllocationService(sheetService);
    jest.spyOn(sheetService, 'getSheetData').mockResolvedValue(sampleData);
  });
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
      ).rejects.toThrow('Failed to fetch data');
    });
  });

  describe('get availableEmployees', () => {
    it('should return all available employees', async () => {
      const year = 2024;
      const month = 'Jun';

      const expectedResult = {
        year,
        month,
        availableEmployees: [
          {
            name: 'Test person',
            status: 'available',
            value: 0,
          },
        ],
      };

      const result = await service.getAvailableEmployees(
        year,
        month,
        dummyAccessToken,
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('get future availability', () => {
    it('should return future availability for an employee', async () => {
      const person = 'Test person';

      const expectedResult = {
        name: person,
        futureAvailability: [
          {
            value: 0,
            year: new Date().getFullYear() + 2,
            month: 'Jun',
            status: 'available',
          },
          {
            value: 0,
            year: new Date().getFullYear() + 2,
            month: 'Jun',
            status: 'flexible_start',
          },
        ],
      };

      jest
        .spyOn(sheetService, 'getSheetData')
        .mockResolvedValue(sampleDataForFuture);

      const result = await service.getFutureAvailability(
        person,
        dummyAccessToken,
      );

      expect(result).toEqual(expectedResult);
    });
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

    const result = await service.getAllocationByName(name);
    expect(result).toEqual(expectedResult);
  });
});
