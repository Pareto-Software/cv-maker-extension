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
    const employees = await this.supabaseService.getEmployeesSkillsAndProject();
    return { employees };
  }

  @Get('employees')
  @HttpCode(200)
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
}
