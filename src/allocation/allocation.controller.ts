import {
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  AvailableEmployeesDTO,
  FutureAllocationResponseDTO,
  AllocationByMonthResponseDTO,
  AllocationResponseDTO,
} from './dtos.js';
import { AllocationService } from './allocation.service.js';
import { Public } from '../oauth2/groups.decorator.js';

@Controller('allocation')
@ApiTags('Allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Get('sheetdata')
  @Public()
  @ApiOperation({ summary: 'Fetch allocation data for all employees' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved allocation data for all employees',
  })
  async fetchSheetData(@Headers() headers: Record<string, string>) {
    const access_token = headers.authorization;
    const data = await this.allocationService.getSheetData(access_token);
    return { data };
  }

  @Get('detail')
  @Public()
  @ApiOperation({
    summary: 'Fetch employee allocation data by detail',
    description: `Fetches allocation data for a specified employee, 
                  including their capacity for each month and year`,
  })
  @ApiQuery({
    name: 'lastName',
    type: String,
    description: 'Employee last name',
  })
  @ApiQuery({
    name: 'firstName',
    type: String,
    description: 'Employee first name',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved allocation data for an employee',
  })
  async getAllocationByName(
    @Query('lastName') lastName: string,
    @Query('firstName') firstName: string,
    @Headers() headers: Record<string, string>,
  ): Promise<AllocationResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    try {
      const data = await this.allocationService.getAllocationByName(
        lastName,
        firstName,
        access_token,
      );
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Retrieve employee names from Allocation data',
    description: 'Fetches names of all employees from allocation data',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved all employee names from allocation data',
  })
  async getAllEmployees(
    @Headers() headers: Record<string, string>,
  ): Promise<{ employees: string[] }> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }

    const employeeNames =
      await this.allocationService.getAllEmployeeNames(access_token);
    return { employees: employeeNames };
  }
  @Get('allocations')
  @Public()
  @ApiOperation({
    summary: 'Retrieve all employees allocation data by month and year',
    description: `Fetches a list of employees allocation data for a specific year 
                  and month`,
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    description: 'Year to filter allocation data by',
  })
  @ApiQuery({
    name: 'month',
    type: String,
    description: 'Month to filter allocation data by',
  })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved employee data',
    type: AllocationByMonthResponseDTO,
  })
  async getAllocationsByMonthYear(
    @Query('year', ParseIntPipe) year: number,
    @Query('month') month: string,
    @Headers() headers: Record<string, string>,
  ): Promise<AllocationByMonthResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }

    const response = await this.allocationService.getAllocationsByMonthYear(
      year,
      month,
      access_token,
    );
    return response;
  }

  @Get('available')
  @Public()
  @ApiOperation({
    summary: 'Retrieve available employees by month and year',
    description: `Fetches a list of available employees for a specific year 
                  and month`,
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    description: 'Year to filter availability data by',
  })
  @ApiQuery({
    name: 'month',
    type: String,
    description: 'Month to filter availability data by',
  })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved available employee data',
    type: AvailableEmployeesDTO,
  })
  async availableAtSpecificMonth(
    @Query('year', ParseIntPipe) year: number,
    @Query('month') month: string,
    @Headers() headers: Record<string, string>,
  ): Promise<AvailableEmployeesDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    return this.allocationService.getAvailableEmployees(
      year,
      month,
      access_token,
    );
  }

  @Get('future')
  @Public()
  @ApiOperation({
    summary: 'Retrieve future availability for an employee',
    description: `Fetches future availability details for a specified employee,
                  including reservation percentage and status for upcoming months.`,
  })
  @ApiQuery({
    name: 'lastName',
    type: String,
    description: 'Employee last name',
  })
  @ApiQuery({
    name: 'firstName',
    type: String,
    description: 'Employee first name',
  })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved future availability data',
    type: FutureAllocationResponseDTO,
  })
  async futureAvailability(
    @Query('lastName') lastName: string,
    @Query('firstName') firstName: string,
    @Headers() headers: Record<string, string>,
  ): Promise<FutureAllocationResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    return this.allocationService.getFutureAvailability(
      lastName,
      firstName,
      access_token,
    );
  }
}
