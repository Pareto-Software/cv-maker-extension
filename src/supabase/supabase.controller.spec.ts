import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller.js';
import { SupabaseService } from './supabase.service.js;
import { EmployeeFullDetailDTO } from './dto/employees-response.dto.js';

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
            getEmployeesFullInformation: jest.fn(),
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
      expect(service.getEmployeesFullInformation).toHaveBeenCalledWith(
        'John',
        'Doe',
      );
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

      expect(service.getEmployeesFullInformation).toHaveBeenCalledWith(
        'John',
        'Doe',
      );
    });
  });
});
