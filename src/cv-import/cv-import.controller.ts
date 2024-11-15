import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../jwt/jwt.guard.js';
import { CvImportService } from './cv-import.service.js';

@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  constructor(private readonly cvImportService: CvImportService) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Post('process/cvfiles')
  async importCv(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { user: string },  
  ) {
    console.log('Processing CV files sent by gateway');
    try {
      if (!body.user) {    
        throw new BadRequestException('No user specified');
      }

      return await this.cvImportService.processFiles(files);
    } catch(BadRequestException) {
      return HttpStatus.BAD_REQUEST;
    }   
  }
}
