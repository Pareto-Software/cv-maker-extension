import {
  Controller,
  Get,
  Param,
  HttpCode,
  UsePipes,
  NotFoundException,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { tableNameWithDescriptionSchema } from './table-name.schema';
import { SupabaseService } from './supabase.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TableNameDto } from './dto/table-name.dto';
import {
  EmployeeFullDetailDTO,
  EmployeesResponseDTO,
} from './dto/employees-response.dto';

@ApiTags('Supabase ')
@Controller()
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('fetch-profiles')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch profiles data' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched data',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              profile_pic: { type: 'string' },
              social_media_links: { type: 'string' },
              user_id: { type: 'string', format: 'uuid' },
              metadata: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async fetchProfiles() {
    const data = await this.supabaseService.getProfilesData();
    console.log(data);
    return { data };
  }

  @Get('fetch-table/:table_name')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch table name' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched table name',
    schema: {
      type: 'object',
      properties: {
        table_name: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, Invalid table name',
  })
  @UsePipes(new ZodValidationPipe(tableNameWithDescriptionSchema))
  async fetchTable(@Param() params: TableNameDto) {
    const data = await this.supabaseService.getTableData(params.table_name);
    console.log(data);
    return { table_name: params.table_name, data };
  }

  @Get('employees/skills-projects')
  @ApiOperation({ summary: 'Fetch employee profiles, skills, and projects' })
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

  @Get('employees/:first_name/:last_name')
  @HttpCode(200)
  @ApiOperation({ summary: 'Retrieve employee CV information by full name' })
  @ApiParam({
    name: 'first_name',
    type: String,
    description: 'Employee first name',
  })
  @ApiParam({
    name: 'last_name',
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
    @Param('first_name') firstName: string,
    @Param('last_name') lastName: string,
  ): Promise<EmployeeFullDetailDTO> {
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
