import { Controller, Get, HttpCode} from '@nestjs/common';
import {AllocationService} from './allocation.service';

@Controller('allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Get('sheetdata')
  @HttpCode(200)
  async fetchSheetData() {
    console.log("Trying to fetch sheetdata");
    const access_token = "access_token";
    const data = await this.allocationService.getSheetData(access_token);
    console.log(data);
    return { data };
  }
}
