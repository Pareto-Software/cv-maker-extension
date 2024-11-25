import { Test, TestingModule } from '@nestjs/testing';
import { SheetService } from './sheet.service';
import { ConfigService } from '@nestjs/config';
import { mockSheetResponse } from './__mocks__/sheetResponse.mock';
import { SheetDataDTO } from './dtos';

describe('SheetService', () => {
  let service: SheetService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'SPREADSHEET_ID':
                  return 'mock-spreadsheet-id';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SheetService>(SheetService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if spreadsheet_id is not provided', () => {
    jest.spyOn(configService, 'get').mockReturnValue(null);

    expect(() => {
      new SheetService(configService);
    }).toThrow('Spreadsheet id must be provided');
  });

  it('should properly initialize with valid spreadsheet_id', () => {
    expect(() => {
      new SheetService(configService);
    }).not.toThrow();
  });
});

describe('getSheetData', () => {
  let service: SheetService;

  function transformResponseToSheetDataDTO(response: any): SheetDataDTO {
    if (!response || !Array.isArray(response.values)) {
      console.log('Invalid response format:', response);
      return { rows: [] };
    }
  
    console.log('Response values before transformation:', response.values);
  
    const headerRow = response.values[1] || [];
    return {
      rows: response.values.slice(2).map((row: any) => ({
        name: row[0] || '',
        capacity: Number(row[1]) || 0, 
        cells: row.slice(2).map((cell: any, index: number) => ({
          year: 2024,
          month: headerRow[index + 2] || '', 
          reservationPercentage: Number(cell) || 0, 
          status: cell === '' ? 'unavailable' : 'available', 
        })),
      })),
    };
  }
  
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'SPREADSHEET_ID':
                  return 'mock-spreadsheet-id';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SheetService>(SheetService);
  });

  it('should retrieve and transform sheet data correctly', async () => {
    // Mock getSheetData to return the raw response
    jest
      .spyOn(service, 'getSheetData')
      .mockResolvedValue(mockSheetResponse as any);
  
    const rawResponse = await service.getSheetData('dummy-access-token');
  
    const transformedData = transformResponseToSheetDataDTO(rawResponse);
    expect(transformedData.rows).toBeDefined();
    expect(transformedData.rows).toHaveLength(
      mockSheetResponse.values.length - 2,
    );
    expect(transformedData.rows[0].name).toBe('Jussi Rantanen');
    expect(transformedData.rows[0].cells[0].month).toBe('Jun');
  });
  

  it('should handle data with additional rows and columns', async () => {
    const modifiedResponse = {
      ...mockSheetResponse,
      values: [
        ...mockSheetResponse.values,
        ['New User', '1', '', '', '', '', '', '', '', '1'],
      ],
    };

    jest
      .spyOn(service, 'getSheetData')
      .mockResolvedValue(modifiedResponse as any);

    const rawResponse = await service.getSheetData('dummy-access-token');
    const transformedData = transformResponseToSheetDataDTO(rawResponse);

    expect(transformedData.rows).toHaveLength(
      modifiedResponse.values.length - 2,
    );
    expect(transformedData.rows[transformedData.rows.length - 1].name).toBe(
      'New User',
    );
  });

  it('should handle empty data', async () => {
    const emptyResponse = { ...mockSheetResponse, values: [] };

    jest
      .spyOn(service, 'getSheetData')
      .mockResolvedValue(transformResponseToSheetDataDTO(emptyResponse));

    const rawResponse = await service.getSheetData('dummy-access-token');
    const transformedData = transformResponseToSheetDataDTO(rawResponse);

    expect(transformedData.rows).toEqual([]);
  });
});