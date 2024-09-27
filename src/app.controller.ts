import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags('Data Operations')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello message' })
  @ApiResponse({status: 200, description: 'Successfully returned hello message'})
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('fetch-profiles')
  @ApiOperation({ summary: 'Fetch profiles from the database' })
  @ApiResponse({ status: 200, description: 'Successfully fetched profiles' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchProfiles() {
    const data = await this.appService.fetchProfiles();
    console.log(data);
    return 'test data from table profiles: ' + JSON.stringify(data, null, 2);
  }

  @Get('fetch-table/:table_name')
  @UsePipes(new ZodValidationPipe(tableNameSchema))
  @ApiOperation({ summary: 'Fetch data from a specific table' })
  @ApiResponse({ status: 200, description: 'Successfully fetched data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'Invalid table name' })
  async fetchTable(@Param('table_name') table_name: ValidTableName) {
    const data = await this.appService.fetchTable(table_name);
    console.log(data);
    return 'test data from table ' + table_name + ': '+ JSON.stringify(data, null, 2);
  }
}
