import { Controller, Get } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('skills-projects')
  @ApiOperation({ summary: 'Fetch employee profiles, skills, and projects' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched employee data',
    schema: {
      type: 'object',
      properties: {
        employees: {
          description: 'A list of all the employees in the database',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { 
                description: 'name of the employee',
                type: 'string',
              },
              skills: {
                description:
                  'A list of skills an employee has listed on their CV,',
                type: 'array',
                items: { type: 'string' }
              },
              projects: {
                description:
                  'A list of each project an employee has participated in',
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      }
    }
  })
  async getEmployeesWithSkillsAndProjects() {
    const employees =
      await this.employeesService.getEmployeesSkillsAndProjects();
    return { employees };
 
  }
}
 