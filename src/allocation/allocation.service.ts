import { Injectable, NotFoundException } from '@nestjs/common';
import { SheetService } from '../sheet/sheet.service';
import { CellValueDTO, SheetDataDTO, StatusValue, Month } from '../sheet/dtos';

export interface AllocationDataDTO {
  [year: string]: {
    [month in Month]?: {
      reservationPercentage: number | null;
      status: StatusValue;
    };
  };
}

export interface AllocationResponseDTO {
  name: string;
  capacity: number;
  data: AllocationDataDTO;
}

@Injectable()
export class AllocationService {
  constructor(private readonly sheetService: SheetService) {}
  // Do functions that transform sheet data here

  async getSheetData(access_token: string) {
    return await this.sheetService.getSheetData(access_token);
  }

  async getAllocationByName(
    name: string,
    access_token: string,
  ): Promise<AllocationResponseDTO> {
    // Fetch all sheet data
    const sheetData: SheetDataDTO =
      await this.sheetService.getSheetData(access_token);

    // Find the employee by name (case-insensitive)
    const employee = sheetData.rows.find(
      (row) => row.name.toLowerCase() === name.toLowerCase(),
    );

    if (!employee) {
      throw new NotFoundException(`Employee ${name} not found.`);
    }

    // Transform the cells array into the required data format
    const data = this.transformCellsToData(employee.cells);

    // Build and return the response object
    const response: AllocationResponseDTO = {
      name: employee.name,
      capacity: employee.capacity,
      data: data,
    };

    return response;
  }

  async getAllEmployeeNames(access_token: string): Promise<string[]> {
    // Fetch sheet data using the access_token
    const sheetData = await this.sheetService.getSheetData(access_token);

    // Extract unique employee names
    const employeeNames = new Set<string>();
    sheetData.rows.forEach((row) => {
      employeeNames.add(row.name);
    });

    return Array.from(employeeNames);
  }

  private transformCellsToData(cells: CellValueDTO[]): AllocationDataDTO {
    const data: AllocationDataDTO = {};

    cells.forEach((cell) => {
      const { year, month, reservationPercentage, status } = cell;

      if (!data[year]) {
        data[year] = {};
      }

      data[year][month] = {
        reservationPercentage,
        status,
      };
    });

    return data;
  }
}
