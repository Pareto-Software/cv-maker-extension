import { Module } from '@nestjs/common';
import { AllocationService } from './allocation.service.js';
import { AllocationController } from './allocation.controller.js';
import { SheetService } from '../sheet/sheet.service.js';
import { SheetModule } from '../sheet/sheet.module.js';

@Module({
  imports: [SheetModule],
  providers: [AllocationService, SheetService],
  controllers: [AllocationController],
})
export class AllocationModule {}
