import { Controller, Get, Param } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { tableNameSchema, ValidTableName } from './table-name.schema';
import { UsePipes } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('fetch-profiles')
  async fetchProfiles() {
    const data = await this.appService.fetchProfiles();
    console.log(data);
    return 'test data from table profiles: ' + JSON.stringify(data, null, 2);
  }

  @Get('fetch-table/:table_name')
  @UsePipes(new ZodValidationPipe(tableNameSchema))
  async fetchTable(@Param('table_name') table_name: ValidTableName) {
    const data = await this.appService.fetchTable(table_name);
    console.log(data);
    return 'test data from table ' + table_name + ': '+ JSON.stringify(data, null, 2);
  }
}
