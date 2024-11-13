import {
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
import { PdfParserService } from './pdfParser.service.js';

// Manages HTTP requests and routing.
@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  constructor(private readonly pdfParserService: PdfParserService) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Post('process/cvfiles')
  async importCv(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { user: string },
    //@Req() request: Request,
  ) {
    console.log('Processing CV files');
    try {
      if (body.user) {
        console.log(body.user);
        this.pdfParserService.processPdfContent(files[0]);
      }
      return HttpStatus.NO_CONTENT; // 204
    } catch (error) {
      throw new HttpException(
        `Failed to import CV ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR, //500
      );
    }
  }
}
