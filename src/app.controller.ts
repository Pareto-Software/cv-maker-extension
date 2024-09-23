import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('fetch-data')
  async fetchData() {
    const data = await this.appService.fetchData();
    console.log(data);
    return 'test data from some_table: ' + data;
  }
}
