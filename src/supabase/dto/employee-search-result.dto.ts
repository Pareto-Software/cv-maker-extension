import { EmployeeFullDetailDTO } from './employees-response.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class EmployeeSearchResultDTO extends EmployeeFullDetailDTO {
  @ApiProperty({
    description: 'Number of times a project of this employee was matched',
    type: Number,
  })
  matchingProjects: number;
}
