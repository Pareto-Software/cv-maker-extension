import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDTO {
  @ApiProperty({ description: 'name of the employee', type: 'string' })
  name: string;

  @ApiProperty({
    description: 'A list of skills an employee has listed on their CV',
    type: 'array',
    items: { type: 'string' },
  })
  skills: string[];

  @ApiProperty({
    description: 'A list of each project an employee has participated in',
    type: 'array',
    items: { type: 'string' },
  })
  projects: string[];
}

export class EmployeesResponseDTO {
  @ApiProperty({
    description: 'A list of all the employees in the database',
    type: [EmployeeDTO],
  })
  employees: EmployeeDTO[];
}
