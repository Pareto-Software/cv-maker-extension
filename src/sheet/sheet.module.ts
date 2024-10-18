import { Module } from '@nestjs/common';
import { SheetService } from './sheet.service';
import {SheetsClientProvider} from './sheets-client.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SheetService, SheetsClientProvider],
  exports: [SheetService, SheetsClientProvider],
})
export class SheetModule {}
