import { Controller, Get, Headers, HttpCode} from '@nestjs/common';
import {AllocationService} from './allocation.service';

@Controller('allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Get('sheetdata')
  @HttpCode(200)
  async fetchSheetData(@Headers() headers: Record<string, string>) {
    console.log('Auth Header:', headers.authorization);
    console.log("Trying to fetch sheetdata");
    const access_token = headers.authorization;
    const data = await this.allocationService.getSheetData(access_token);
    console.log(data);
    return { data };
  }
}
