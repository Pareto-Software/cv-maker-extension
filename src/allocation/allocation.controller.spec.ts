import { Test, TestingModule } from '@nestjs/testing';
import { AllocationController } from './allocation.controller';
import { AllocationService } from './allocation.service';
import {
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AllocationResponseDTO } from './allocation.service';

describe('controller', () => {
  let controller: AllocationController;
  let service: AllocationService;
  const headers = {
    authorization: 'Bearer dummy-access-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllocationController],
      providers: [
        {
          provide: AllocationService,
          useValue: {
            // Mock methods of AllocationService as needed
            getAllocationByName: jest.fn(),
            getAllEmployeeNames: jest.fn(),
            getAllocationsByMonthYear: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AllocationController>(AllocationController);
    service = module.get<AllocationService>(AllocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    (service.getAllocationByName as jest.Mock).mockResolvedValue(
      expectedResult,
    );
    const result = await controller.getAllocationByName(name, headers);
    expect(result).toEqual(expectedResult);
    expect(service.getAllocationByName).toHaveBeenCalledWith(
      name,
      'dummy-access-token',
    );
  });

  it('should throw NotFoundException if employee does not exist', async () => {
    const name = 'Nonexistent Person';

    (service.getAllocationByName as jest.Mock).mockImplementation(() => {
      throw new NotFoundException(`Employee ${name} not found.`);
    });

    await expect(controller.getAllocationByName(name, headers)).rejects.toThrow(
      NotFoundException,
    );
    expect(service.getAllocationByName).toHaveBeenCalledWith(
      name,
      'dummy-access-token',
    );
  });

  it('should handle case-insensitive employee names', async () => {
    const name = 'test PERSON';
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

    (service.getAllocationByName as jest.Mock).mockResolvedValue(
      expectedResult,
    );

    const result = await controller.getAllocationByName(name, headers);
    expect(result).toEqual(expectedResult);
    expect(service.getAllocationByName).toHaveBeenCalledWith(
      name,
      'dummy-access-token',
    );
  });
  describe('getAllEmployeeNames', () => {
    it('should return a list of employee names', async () => {
      const expectedNames = ['Test person', 'Test person2', 'Test person3'];

      (service.getAllEmployeeNames as jest.Mock).mockResolvedValue(
        expectedNames,
      );

      const result = await controller.getAllEmployees(headers);
      expect(result).toEqual({ employees: expectedNames });
      expect(service.getAllEmployeeNames).toHaveBeenCalledWith(
        'dummy-access-token',
      );
    });

    it('should throw UnauthorizedException if access_token is missing', async () => {
      const invalidHeaders = {};

      await expect(controller.getAllEmployees(invalidHeaders)).rejects.toThrow(
        UnauthorizedException,
      );
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

      (service.getAllocationsByMonthYear as jest.Mock).mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.getAllocationsByMonthYear(
        year,
        month,
        headers,
      );

      expect(result).toEqual(expectedResponse);
      expect(service.getAllocationsByMonthYear).toHaveBeenCalledWith(
        year,
        month,
        'dummy-access-token',
      );
    });

    it('should throw UnauthorizedException if access_token is missing', async () => {
      const year = 2024;
      const month = 'Jun';
      const invalidHeaders = {};

      await expect(
        controller.getAllocationsByMonthYear(year, month, invalidHeaders),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate NotFoundException from the service', async () => {
      const year = 2030;
      const month = 'Dec';

      (service.getAllocationsByMonthYear as jest.Mock).mockRejectedValue(
        new NotFoundException('No allocation data found'),
      );

      await expect(
        controller.getAllocationsByMonthYear(year, month, headers),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle InternalServerErrorException from the service', async () => {
      const year = 2024;
      const month = 'Jun';

      (service.getAllocationsByMonthYear as jest.Mock).mockRejectedValue(
        new InternalServerErrorException('Failed to fetch allocation data'),
      );

      await expect(
        controller.getAllocationsByMonthYear(year, month, headers),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
