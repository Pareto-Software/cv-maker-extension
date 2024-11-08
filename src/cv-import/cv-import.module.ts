import { Module } from '@nestjs/common';
import { CvImportController } from './cv-import.controller';
import { CvImportService } from './cv-import.service';

@Module({
  controllers: [CvImportController],
  providers: [CvImportService]
})
export class CvImportModule {}
