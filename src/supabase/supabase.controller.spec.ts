import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller.js';
import { SupabaseService } from './supabase.service.js';
import {
  EmployeeFullDetailDTO,
  ProjectDTO,
} from './dto/employees-response.dto.js';

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
            searchProjectsByVector: jest.fn(),
            getEmployeesFullInformationByIds: jest.fn(),
            getEmployeesSkillsAndProject: jest.fn(),
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
        id: 123,
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
  describe('searchEmployees', () => {
    it('should return employees with matchingProjects', async () => {
      const query = 'typescript';
      const limit = 10;

      // Updated mockProjects to match expected matchingProjects counts
      const mockProjects: ProjectDTO[] = [
        // Three projects for user_id '1'
        {
          name: 'Project A',
          description: 'Description A',
          company: 'Company A',
          role: 'Role A',
          start_date: '2021-01-01',
          end_date: '2021-12-31',
          user_id: '1',
        },
        {
          name: 'Project B',
          description: 'Description B',
          company: 'Company B',
          role: 'Role B',
          start_date: '2020-01-01',
          end_date: '2020-12-31',
          user_id: '1',
        },
        {
          name: 'Project D',
          description: 'Description D',
          company: 'Company D',
          role: 'Role D',
          start_date: '2019-01-01',
          end_date: '2019-12-31',
          user_id: '1',
        },
        // Two projects for user_id '2'
        {
          name: 'Project C',
          description: 'Description C',
          company: 'Company C',
          role: 'Role C',
          start_date: '2018-06-01',
          end_date: '2019-06-01',
          user_id: '2',
        },
        {
          name: 'Project E',
          description: 'Description E',
          company: 'Company E',
          role: 'Role E',
          start_date: '2017-01-01',
          end_date: '2017-12-31',
          user_id: '2',
        },
      ];

      // Added user_id to mockEmployeesData
      const mockEmployeesData: EmployeeFullDetailDTO[] = [
        {
          id: 1,
          user_id: '1', // Added user_id
          name: 'User One',
          title: 'Developer',
          description: 'An experienced developer',
          education: {
            school: 'University A',
            graduationYear: 2020,
            degree: "Bachelor's",
            field: 'Computer Science',
            thesis: 'Thesis Title A',
          },
          skills: [
            { name: 'TypeScript', level: 5 },
            { name: 'JavaScript', level: 5 },
          ],
          projects: [
            {
              name: 'Project A',
              description: 'Project A Description',
              company: 'Company A',
              role: 'Developer',
              start_date: '2019-01-01',
              end_date: '2020-01-01',
            },
          ],
          certifications: [
            {
              name: 'Certification A',
              received: '2020-05-01',
              valid_until: '2023-05-01',
            },
          ],
        },
        {
          id: 2,
          user_id: '2', // Added user_id
          name: 'User Two',
          title: 'Engineer',
          description: 'A skilled engineer',
          education: {
            school: 'University B',
            graduationYear: 2018,
            degree: "Master's",
            field: 'Software Engineering',
            thesis: 'Thesis Title B',
          },
          skills: [
            { name: 'TypeScript', level: 4 },
            { name: 'Angular', level: 4 },
          ],
          projects: [
            {
              name: 'Project B',
              description: 'Project B Description',
              company: 'Company B',
              role: 'Engineer',
              start_date: '2018-06-01',
              end_date: '2019-06-01',
            },
          ],
          certifications: [
            {
              name: 'Certification B',
              received: '2019-08-01',
              valid_until: '2022-08-01',
            },
          ],
        },
      ];

      jest
        .spyOn(service, 'searchProjectsByVector')
        .mockResolvedValue(mockProjects);
      jest
        .spyOn(service, 'getEmployeesFullInformationByIds')
        .mockResolvedValue(mockEmployeesData);

      const result = await controller.searchEmployees(query, limit);

      expect(result).toEqual([
        {
          ...mockEmployeesData[0],
          matchingProjects: 3, // User 1 has 3 projects
        },
        {
          ...mockEmployeesData[1],
          matchingProjects: 2, // User 2 has 2 projects
        },
      ]);

      expect(service.searchProjectsByVector).toHaveBeenCalledWith(query, limit);
      expect(service.getEmployeesFullInformationByIds).toHaveBeenCalledWith([
        '1',
        '2',
      ]);
    });
  });
});
