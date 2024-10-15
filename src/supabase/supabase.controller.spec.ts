import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from './supabase.service';
import { TableNameDto } from '../dto/table-name.dto';

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
      const mockData = [
        {
          id: 1,
          description: null,
          education: null,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          metadata: null,
          profile_pic: null,
          social_media_links: null,
          title: null,
          user_id: 'user_1',
        },
      ];
      jest.spyOn(service, 'getProfilesData').mockResolvedValue(mockData);

      const result = await controller.fetchProfiles();

      expect(result).toEqual({ data: mockData });
      expect(service.getProfilesData).toHaveBeenCalled();
    });
  });

  describe('fetchTable', () => {
    it('should return data from SupabaseService for a valid table name', async () => {
      const mockData = [
        {
          id: 1,
          description: null,
          education: null,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          metadata: null,
          profile_pic: null,
          social_media_links: null,
          title: null,
          user_id: 'user_1',
        },
      ];
      const tableNameDto: TableNameDto = {
        table_name: 'profiles',
        description: 'Profile description',
      };
      jest.spyOn(service, 'getTableData').mockResolvedValue(mockData);
      const result = await controller.fetchTable(tableNameDto);
      expect(result).toEqual({
        table_name: tableNameDto.table_name,
        data: mockData,
      });
      expect(service.getTableData).toHaveBeenCalledWith(
        tableNameDto.table_name,
      );
    });
  });
});
