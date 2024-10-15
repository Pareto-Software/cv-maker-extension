import { Module } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { AllocationController } from './allocation.controller';
import { SheetService } from '../sheet/sheet.service';

@Module({
  providers: [AllocationService, SheetService],
  controllers: [AllocationController],
})
export class AllocationModule {}
