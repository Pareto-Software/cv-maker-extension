import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  NotFoundException,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AvailableEmployeesDTO,
  FutureAllocationResponseDTO,
  AllocationByMonthResponseDTO,
  AllocationResponseDTO
} from './dtos';
import { AllocationService } from './allocation.service';

@Controller('allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}
  @Get('sheetdata')
  @HttpCode(200)
  async fetchSheetData(@Headers() headers: Record<string, string>) {
    console.log('Auth Header:', headers.authorization);
    console.log('Trying to fetch sheetdata');
    const access_token = headers.authorization;
    const data = await this.allocationService.getSheetData(access_token);
    console.log('moi');
    console.log(data);
    return { data };
  }

  @Get(':name')
  async getAllocationByName(
    @Param('name') name: string,
    @Headers() headers: Record<string, string>,
  ): Promise<AllocationResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    try {
      const data = await this.allocationService.getAllocationByName(
        name,
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
    @Param('year', ParseIntPipe) year: number,
    @Param('month') month: string,
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
    @Param('year', ParseIntPipe) year: number,
    @Param('month') month: string,
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
  @HttpCode(200)
  @ApiResponse({
    type: FutureAllocationResponseDTO,
  })
  async futureAvailability(
    @Param('name') name: string,
    @Headers() headers: Record<string, string>,
  ): Promise<FutureAllocationResponseDTO> {
    const access_token = headers.authorization?.replace('Bearer ', '').trim();
    if (!access_token) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    return this.allocationService.getFutureAvailability(name, access_token);
  }
}
