
import { AllocationService, AllocationResponseDTO } from './allocation.service';
import { Controller, Get, Headers, HttpCode, Param, NotFoundException} from '@nestjs/common';


@Controller('allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}


  @Get(':name')
  async getAllocationByName(
    @Param('name') name: string,
  ): Promise<AllocationResponseDTO> {
    try {
      const data = await this.allocationService.getAllocationByName(name);
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('An unexpected error occurred.');
    }

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
