import { Test, TestingModule } from '@nestjs/testing';
import { SheetService } from './sheet.service';
import { ConfigService } from '@nestjs/config';

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
