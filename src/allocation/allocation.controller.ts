import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AllocationService, AllocationResponseDTO } from './allocation.service';

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
  }
}
