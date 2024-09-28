import { Controller, Get, Param, HttpCode } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { tableNameSchema, ValidTableName } from './table-name.schema';
import { UsePipes } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(200)
  getHello() {
    return { message: this.appService.getHello() };
  }

  @Get('fetch-profiles')
  @HttpCode(200)
  async fetchProfiles() {
    const data = await this.appService.fetchProfiles();
    console.log(data);
    return { data };
  }

  @Get('fetch-table/:table_name')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(tableNameSchema))
  async fetchTable(@Param('table_name') table_name: ValidTableName) {
    const data = await this.appService.fetchTable(table_name);
    console.log(data);
    return { table_name, data };
  }
}
