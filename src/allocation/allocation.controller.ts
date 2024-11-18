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
} from './dtos';
import { AllocationService } from './allocation.service';

@Controller('allocation')
@ApiTags('Allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Get('sheetdata')
  @ApiOperation({ summary: 'Fetch allocation data for all employees' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved allocation data for all employees',
  })
  async fetchSheetData(@Headers() headers: Record<string, string>) {
    console.log('Auth Header:', headers.authorization);
    console.log('Trying to fetch sheetdata');
    const access_token = headers.authorization;
    const data = await this.allocationService.getSheetData(access_token);
    console.log('moi');
    console.log(data);
    return { data };
  }

  @Get('detail')
  @ApiOperation({
    summary: 'Fetch employee allocation data by detail',
    description: `Fetches allocation data for a specified employee, 
                  including their capacity for each month and year`,
  })
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
    description: 'Successfully retrieved allocation data for an employee',
  })
  async getAllocationByName(
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Headers() headers: Record<string, string>,
  ): Promise<AllocationResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    try {
      const data = await this.allocationService.getAllocationByName(
        firstName,
        lastName,
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

  @Get('available/:year/:month')
  @ApiOperation({
    summary: 'Retrieve all employees allocation data by month and year',
    description: `Fetches a list of employees for a specific year 
                  and month, along with their availability details`,
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
    type: AvailableEmployeesDTO,
  })
  @Get(':year/:month')
  @HttpCode(200)
  @ApiResponse({
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

  @Get(':name/future')
  @ApiOperation({
    summary: 'Retrieve future availability for an employee',
    description: `Fetches future availability details for a specified employee,
                  including reservation percentage and status for upcoming months.`,
  })
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
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved future availability data',
    type: FutureAllocationResponseDTO,
  })
  async futureAvailability(
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Headers() headers: Record<string, string>,
  ): Promise<FutureAllocationResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    return this.allocationService.getFutureAvailability(
      firstName,
      lastName,
      access_token,
    );
  }
}
