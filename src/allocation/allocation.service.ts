import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SheetService } from '../sheet/sheet.service';
import { CellValueDTO, SheetDataDTO, Month } from '../sheet/dtos';
import {
  AllocationRow,
  AvailableEmployeesDTO,
  AllocationDataDTO,
  YearData,
  MonthData,
  FutureAllocationResponseDTO,
  AllocationResponseDTO,
  AllocationByMonthResponseDTO,
} from './dtos';

@Injectable()
export class AllocationService {
  constructor(private readonly sheetService: SheetService) {}
  // Do functions that transform sheet data here

  async getSheetData(access_token: string) {
    console.log('Trying to fetch sheetdata in allocation service');
    const middlevar = await this.sheetService.getSheetData(access_token);
    console.log('Middlevar');
    return middlevar;
  }

  async getAllocationByName(
    firstName: string,
    lastName: string,
    access_token: string,
  ): Promise<AllocationResponseDTO> {
    // Fetch all sheet data
    const sheetData: SheetDataDTO =
      await this.sheetService.getSheetData(access_token);

    // Find the employee by name (case-insensitive)
    const employee = sheetData.rows.find(
      (row) =>
        row.name.toLowerCase() ===
        `${firstName.toLowerCase()} ${lastName.toLowerCase()}`,
    );

    if (!employee) {
      throw new NotFoundException(
        `Employee ${firstName} ${lastName} not found.`,
      );
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

  async getAvailableEmployees(
    year: number,
    month: string,
    accessToken: string,
  ): Promise<AvailableEmployeesDTO> {
    const sheetData = await this.sheetService.getSheetData(accessToken);

    const availableRows: AllocationRow[] = [];
    for (const row of sheetData.rows) {
      const cell = row.cells.find(
        (cell) =>
          cell.month.toLowerCase() === month.toLowerCase() &&
          cell.year === year &&
          (cell.status === 'available' || cell.status === 'flexible_start'),
      );

      if (cell) {
        availableRows.push({
          name: row.name,
          value: cell.reservationPercentage,
          status: cell.status,
        });
      }
    }

    return {
      year,
      month,
      availableEmployees: availableRows,
    };
  }

  async getFutureAvailability(
    firstName: string,
    lastName: string,
    accessToken: string,
  ): Promise<FutureAllocationResponseDTO> {
    const sheetData = await this.sheetService.getSheetData(accessToken);

    // Find the employee by name (case-insensitive)
    const employee = sheetData.rows.find(
      (row) =>
        row.name.toLowerCase() ===
        `${firstName.toLowerCase()} ${lastName.toLowerCase()}`,
    );

    if (!employee) {
      throw new NotFoundException(
        `Employee ${firstName} ${lastName} not found.`,
      );
    }

    return {
      name: employee.name,
      futureAvailability: employee.cells
        .filter(
          (cell) =>
            new Date(cell.year, this.parseMonth(cell.month) - 1).getTime() >=
              new Date().getTime() &&
            (cell.status === 'available' || cell.status === 'flexible_start'),
        )
        .map((cell) => ({
          year: cell.year,
          month: cell.month,
          status: cell.status,
          value: cell.reservationPercentage,
        })),
    };
  }

  private transformCellsToData(cells: CellValueDTO[]): AllocationDataDTO {
    const yearsMap: Map<number, YearData> = new Map();

    cells.forEach((cell) => {
      const { year, month, reservationPercentage, status } = cell;

      // Check if the year already exists in the map
      if (!yearsMap.has(year)) {
        yearsMap.set(year, {
          year: year,
          months: [],
        });
      }

      // Get the corresponding YearData
      const yearData = yearsMap.get(year)!;

      // Create a new MonthData object
      const monthData: MonthData = {
        month: month,
        reservationPercentage: reservationPercentage,
        status: status,
      };

      // Add the month data to the year
      yearData.months.push(monthData);
    });

    // Convert the yearsMap to an array
    const yearsArray: YearData[] = Array.from(yearsMap.values());

    // Build and return the AllocationDataDTO
    const allocationData: AllocationDataDTO = {
      years: yearsArray,
    };

    return allocationData;
  }

  /**
   * Returns month as number. We should probably just ask require the users of this to use number directly, it would be much easier.
   */
  private parseMonth(month: Month): number {
    switch (month) {
      case 'Jan':
        return 1;
      case 'Feb':
        return 2;
      case 'Mar':
        return 3;
      case 'Apr':
        return 4;
      case 'May':
        return 5;
      case 'Jun':
        return 6;
      case 'Jul':
        return 7;
      case 'Aug':
        return 8;
      case 'Sep':
        return 9;
      case 'Oct':
        return 10;
      case 'Nov':
        return 11;
      case 'Dec':
        return 12;
    }
  }

  async getAllocationsByMonthYear(
    year: number,
    month: string,
    access_token: string,
  ): Promise<AllocationByMonthResponseDTO> {
    try {
      // Fetch all sheet data
      const sheetData: SheetDataDTO =
        await this.sheetService.getSheetData(access_token);

      // Prepare allocations array
      const allocations: AllocationRow[] = [];

      // Iterate over each employee's data
      sheetData.rows.forEach((employee) => {
        // Find the cell that matches the specified month and year
        const matchingCell = employee.cells.find(
          (cell) =>
            cell.year === year &&
            cell.month.toLowerCase() === month.toLowerCase(),
        );

        if (matchingCell) {
          const employeeAllocation: AllocationRow = {
            name: employee.name,
            value: matchingCell.reservationPercentage,
            status: matchingCell.status,
          };
          allocations.push(employeeAllocation);
        }
      });

      // Check if any allocations were found
      if (allocations.length === 0) {
        throw new NotFoundException(
          `No allocation data found for ${month} ${year}`,
        );
      }

      // Build and return the response object
      const response: AllocationByMonthResponseDTO = {
        year,
        month,
        allocations,
      };

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch allocation data');
    }
  }
}
