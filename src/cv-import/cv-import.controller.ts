import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../jwt/jwt.guard.js';
import { CvImportService } from './cv-import.service.js';
import { Public } from '../oauth2/groups.decorator.js';

//Returns 201 for success.
//Returns 500 when error happens.

@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  constructor(private readonly cvImportService: CvImportService) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Public()
  @Post('process/cvfiles')
  @HttpCode(201)
  async importCv(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { user: string },
  ) {
  
    if (!body.user) {
      throw new BadRequestException('No user specified');
    }

    if(await this.cvImportService.processFiles(files, body.user)) {
      return;
    }

    throw new InternalServerErrorException("Failed to generate CV");
    }
}
