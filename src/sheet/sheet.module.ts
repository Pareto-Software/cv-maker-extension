import { Module } from '@nestjs/common';
import { SheetService } from './sheet.service.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SheetService, ConfigModule],
  exports: [SheetService, ConfigModule],
})
export class SheetModule {}
