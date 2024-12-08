import {
  Controller,
  Get,
  Query,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import {
  EmployeeFullDetailDTO,
  EmployeesResponseDTO,
} from './dto/employees-response.dto.js';
import { EmployeeSearchResultDTO } from './dto/employee-search-result.dto.js';

import { Manager } from '../oauth2/groups.decorator.js';

@ApiTags('Supabase ')
@Controller()
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('employees/skills-projects')
  @Manager()
  @ApiOperation({
    summary: 'Fetch employee skills and projects',
    description:
      'Retrieves a list of employees along with their skills and projects',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched employee data',
    type: EmployeesResponseDTO,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to fetch employee data',
  })
  async getEmployeesWithSkillsAndProjects(): Promise<EmployeesResponseDTO> {
    console.log('calling getEmployeesSkillsAndProject');
    const employees = await this.supabaseService.getEmployeesSkillsAndProject();
    return { employees };
  }

  @Get('employees')
  @HttpCode(200)
  @Manager()
  @ApiOperation({ summary: 'Retrieve employee CV information by full name' })
  @ApiQuery({
    name: 'firstName',
    type: String,
    description: 'Employee first name',
  })
  @ApiQuery({
    name: 'lastName',
    type: String,
    description: 'Employee last name',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved employee data',
    type: EmployeeFullDetailDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async getEmployeeByName(
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
  ): Promise<EmployeeFullDetailDTO> {
    console.log('calling getEmployeeByName');
    if (!firstName || !lastName) {
      throw new BadRequestException(
        'Both firstName and lastName must be provided',
      );
    }
    try {
      const employee = await this.supabaseService.getEmployeesFullInformation(
        firstName,
        lastName,
      );
      return employee;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('employees/search')
  @HttpCode(200)
  @Manager()
  @ApiOperation({
    summary: 'Search for employees based on a query',
    description: `Performs a similarity search on projects and returns employees associated with the matching projects, along with the number of times their projects matched.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved employees',
    type: [EmployeeSearchResultDTO],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    description: 'The search query',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Maximum number of results (projects)',
    required: true,
  })
  async searchEmployees(
    @Query('query') query: string,
    @Query('limit') limit: number,
  ): Promise<EmployeeSearchResultDTO[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    console.log('calling searchProjectsByVector');
    console.log('Query:', query);
    console.log('Limit:', limit);

    const projects = await this.supabaseService.searchProjectsByVector(
      query,
      limit,
    );

    // Map projects to user IDs and count matching projects
    const userProjectCount: Map<string, number> = new Map();
    const userIds = new Set<string>();

    for (const project of projects) {
      const userId: string = project.user_id ?? '';
      if (userId) {
        userIds.add(userId);
        userProjectCount.set(userId, (userProjectCount.get(userId) || 0) + 1);
      }
    }

    const userIdArray = Array.from(userIds);
    const employeesData =
      await this.supabaseService.getEmployeesFullInformationByIds(userIdArray);

    const employees: EmployeeSearchResultDTO[] = employeesData.map(
      (employee) => {
        const matchingProjects =
          userProjectCount.get(employee.user_id ?? '') || 0;
        return {
          ...employee,
          matchingProjects,
        };
      },
    );

    return employees;
  }
}
