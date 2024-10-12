import { Module } from '@nestjs/common';
import { SheetService } from './sheet.service';

@Module({
  providers: [SheetService],
})
export class SheetModule {}
