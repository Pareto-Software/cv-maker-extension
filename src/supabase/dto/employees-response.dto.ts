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

export class EducationDTO {
  @ApiProperty({ description: 'Name of the school', type: 'string' })
  school: string;

  @ApiProperty({ description: 'Year of graduation', type: 'number' })
  graduationYear: number;

  @ApiProperty({ description: 'Degree obtained', type: 'string' })
  degree: string;

  @ApiProperty({ description: 'Field of study', type: 'string' })
  field: string;

  @ApiProperty({ description: 'Title of the thesis', type: 'string' })
  thesis: string;
}

export class SkillDTO {
  @ApiProperty({ description: 'Name of the skill', type: 'string' })
  name: string;

  @ApiProperty({
    description: 'Level of proficiency in the skill',
    type: 'number',
  })
  level: number;
}

export class ProjectDTO {
  @ApiProperty({ description: 'Project name', type: String })
  name: string;

  @ApiProperty({ description: 'Project description', type: String })
  description: string;

  @ApiProperty({
    description: 'Company associated with the project',
    type: String,
  })
  company: string;

  @ApiProperty({ description: 'Role in the project', type: String })
  role: string;

  @ApiProperty({
    description: 'Start date of the project',
    type: String,
    format: 'date',
  })
  start_date: string;

  @ApiProperty({
    description: 'End date of the project',
    type: String,
    format: 'date',
  })
  end_date: string;
}

export class CertificationDTO {
  @ApiProperty({ description: 'Certification name', type: String })
  name: string;

  @ApiProperty({ description: 'Date received', type: String })
  received: string;

  @ApiProperty({ description: 'Valid until', type: String })
  valid_until: string;
}

export class EmployeeFullDetailDTO {
  @ApiProperty({ description: 'Full name of the employee', type: 'string' })
  name: string;

  @ApiProperty({
    description: 'Job title',
    type: 'string',
  })
  title: string;

  @ApiProperty({
    description: 'A short description of who the employee is',
    type: 'string',
  })
  description: string;

  @ApiProperty({
    description: 'Education details of an employee',
    type: EducationDTO,
  })
  education: EducationDTO;

  @ApiProperty({
    description: 'A list of skills an employee has with their levels',
    type: [SkillDTO],
  })
  skills: SkillDTO[];

  @ApiProperty({
    description: 'List of projects the employee worked on',
    type: [ProjectDTO],
  })
  projects: ProjectDTO[];

  @ApiProperty({
    description: 'List of certifications the employee has received',
    type: [CertificationDTO],
  })
  certifications: CertificationDTO[];
}
