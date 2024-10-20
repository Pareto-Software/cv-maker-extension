import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from './supabase.service';
import { TableNameDto } from './dto/table-name.dto';
import { EmployeeFullDetailDTO } from './dto/employees-response.dto';

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
  describe('getEmployeeByName', () => {
    it('should return an employee profile from SupabaseService', async () => {
      const mockEmployee: EmployeeFullDetailDTO = {
        name: 'John Doe',
        title: 'Software Developer',
        description: 'Experienced developer...',
        education: {
          school: 'Tampere University',
          graduationYear: 2024,
          degree: "Bachelor's degree",
          field: 'Computer Science',
          thesis: 'Pilvipalveluiden käyttömallien vertailu',
        },
        skills: [
          { name: 'Python', level: 3 },
          { name: 'Flask', level: 5 },
          { name: 'SQL', level: 4 },
        ],
        projects: [
          {
            name: 'Project Alpha',
            description: 'Developing a new electric bus emergency brake system',
            company: 'Omnibus',
            role: 'Scrum master',
            start_date: '2023-05-09',
            end_date: '2023-09-03',
          },
        ],
        certifications: [
          {
            name: 'SQL Monster',
            received: 'May 5th, 2023',
            valid_until: 'End of 2025',
          },
        ],
      };

      jest
        .spyOn(service, 'getEmployeesFullInformation')
        .mockResolvedValue(mockEmployee);

      const result = await controller.getEmployeeByName('John', 'Doe');

      expect(result).toEqual(mockEmployee);
      expect(service.getEmployeesFullInformation).toHaveBeenCalledWith('John', 'Doe');
    });

    it('should throw a NotFoundException if the employee is not found', async () => {
      jest
        .spyOn(service, 'getEmployeesFullInformation')
        .mockRejectedValue(new Error('Not found'));

      try {
        await controller.getEmployeeByName('John', 'Doe');
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
        expect(error.response.message).toBe('Not found');
      }

      expect(service.getEmployeesFullInformation).toHaveBeenCalledWith('John', 'Doe');
    });
  });
});
