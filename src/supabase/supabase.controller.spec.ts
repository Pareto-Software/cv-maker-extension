import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from './supabase.service';

describe('SupabaseController', () => {
  let controller: SupabaseController;
  let service: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupabaseController],
      providers: [
        {
          provide: SupabaseService,
          useValue: {
            getProfilesData: jest.fn(),
            getTableData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SupabaseController>(SupabaseController);
    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchProfiles', () => {
    it('should return data from SupabaseService', async () => {
      const mockData = [{ id: 1, name: 'Test User' }];
      jest.spyOn(service, 'getProfilesData').mockResolvedValue(mockData);

      const result = await controller.fetchProfiles();

      expect(result).toEqual({ data: mockData });
      expect(service.getProfilesData).toHaveBeenCalled();
    });
  });

  describe('fetchTable', () => {
    it('should return data from SupabaseService for a valid table name', async () => {
      const mockData = [{ id: 1, column: 'Test Data' }];
      const tableName = 'profiles';
      jest.spyOn(service, 'getTableData').mockResolvedValue(mockData);

      const result = await controller.fetchTable(tableName);

      expect(result).toEqual({ table_name: tableName, data: mockData });
      expect(service.getTableData).toHaveBeenCalledWith(tableName);
    });

    it('should throw an error for an invalid table name', async () => {
      const invalidTableName = 'invalid';

      await expect(controller.fetchTable(invalidTableName)).rejects.toThrow();
    });
  });
});
