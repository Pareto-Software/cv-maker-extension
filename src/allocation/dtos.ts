import { ApiProperty } from '@nestjs/swagger';
import { StatusValue } from 'src/sheet/dtos';

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

export class AvailableEmployeesDTO {
  @ApiProperty({
    description: 'Year of the data',
    type: 'year',
  })
  year: number;

  @ApiProperty({
    description: 'Month of the data',
    type: 'string',
  })
  month: string;
  availableEmployees: AllocationRow[];
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
