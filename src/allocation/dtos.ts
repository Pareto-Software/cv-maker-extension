import { ApiProperty } from '@nestjs/swagger';
import { StatusValue } from '../sheet/dtos.js';

// Added this as an example of how description can be added
// If you know that there are more limits for the properties(e.g. string with a max length of 5)
// use the extra properties to define those if possible
export class ExampleResponseDTO {
  @ApiProperty({
    description: 'Name of the example response',
    maxLength: 3,
  })
  name: string;
}

export class MonthData {
  @ApiProperty({
    description: 'Month of the data',
    type: 'string',
    example: 'Jun',
  })
  month: string;

  @ApiProperty({
    description:
      'Reservation percentage for the month (e.g., 0.8 means 80% booked).',
    type: 'number',
    nullable: true,
    example: 0.8,
  })
  reservationPercentage: number | null;

  @ApiProperty({
    description: 'Determines if employee is available for billing.',
    enum: ['available', 'unsure', 'flexible_start', 'unavailable'],
    example: 'available',
  })
  status: StatusValue;
}

export class YearData {
  @ApiProperty({
    description: 'Year of the data',
    type: 'number',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'An array of month data for the year',
    type: [MonthData],
  })
  months: MonthData[];
}

export class AllocationDataDTO {
  @ApiProperty({
    description: 'An array of year data containing allocation information',
    type: [YearData],
  })
  years: YearData[];
}

export class AllocationRow {
  @ApiProperty({
    description: 'Name of the employee',
    type: 'string',
  })
  name: string;
  @ApiProperty({
    description:
      'Represents the reservation percentage (e.g., 0.8 means employee is currently 80% booked, meaning they have the capacity to take on 20% more work).',
    type: 'number',
  })
  value: number;
  @ApiProperty({
    description:
      'Determines if employee is available for billing. Flexible start means that employee can start once called. Unsure means that it is likely(50%) that there is a project, but it is not sure.',
    type: 'enum',
    enum: ['available', 'unsure', 'flexible_start', 'unavailable'],
  })
  status: StatusValue;
}

export class AllocationByMonthResponseDTO {
  @ApiProperty({
    description: 'Year of the data',
    type: 'number',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Month of the data',
    type: 'string',
    example: 'Jun',
  })
  month: string;

  @ApiProperty({
    description: 'An array of employee allocations for the given month',
    type: [AllocationRow],
  })
  allocations: AllocationRow[];
}

export class AllocationResponseDTO {
  @ApiProperty({
    description: 'Name of the employee',
    type: 'string',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Capacity of the employee',
    type: 'number',
    example: 1.0,
  })
  capacity: number;

  @ApiProperty({
    description: 'Allocation data by year and month',
    type: () => AllocationDataDTO,
  })
  data: AllocationDataDTO;
}

export class AvailableEmployeesDTO {
  @ApiProperty({
    description: 'Year of the data',
    type: 'number',
  })
  year: number;

  @ApiProperty({
    description: 'Month of the data',
    type: 'string',
  })
  month: string;
  @ApiProperty({
    description:
      'An array of employees who are available for the given month, along with their value and status',
    type: [AllocationRow],
  })
  availableEmployees: AllocationRow[];
}

export class FutureAllocationRow {
  @ApiProperty({
    description:
      'Represents the reservation percentage (e.g., 0.8 means employee is currently 80% booked, meaning they have the capacity to take on 20% more work).',
    type: 'number',
  })
  value: number;
  @ApiProperty({
    description:
      'Determines if employee is available for billing. Flexible start means that employee can start once called. Unsure means that it is likely(50%) that there is a project, but it is not sure.',
    type: 'enum',
    enum: ['available', 'unsure', 'flexible_start', 'unavailable'],
  })
  status: StatusValue;

  @ApiProperty({
    description: 'Year of the data',
    type: 'number',
  })
  year: number;

  @ApiProperty({
    description: 'Month of the data',
    type: 'string',
  })
  month: string;
}

export class FutureAllocationResponseDTO {
  @ApiProperty({
    description: 'Name of the employee',
    type: 'string',
  })
  name: string;
  @ApiProperty({
    description:
      'Contains future months where the employee is available and the corresponding status',
    type: [FutureAllocationRow],
  })
  futureAvailability: FutureAllocationRow[];
}
