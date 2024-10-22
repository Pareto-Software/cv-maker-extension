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
import {
  AllocationService,
  AllocationResponseDTO,
  AllocationByMonthResponseDTO,
} from './allocation.service';

@Controller('allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

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

  @Get(':year/:month')
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

  @Get('sheetdata')
  @HttpCode(200)
  async fetchSheetData(@Headers() headers: Record<string, string>) {
    console.log('Auth Header:', headers.authorization);
    console.log('Trying to fetch sheetdata');
    const access_token = headers.authorization;
    const data = await this.allocationService.getSheetData(access_token);
    console.log(data);
    return { data };
  }
}
