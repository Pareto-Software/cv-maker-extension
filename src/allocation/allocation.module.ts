import { Module } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { AllocationController } from './allocation.controller';
import { SheetService } from '../sheet/sheet.service';
import { SheetModule } from '../sheet/sheet.module';

@Module({
  imports: [SheetModule],
  providers: [AllocationService, SheetService],
  controllers: [AllocationController],
})
export class AllocationModule {}
