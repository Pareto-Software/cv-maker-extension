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
import { Public } from '../oauth2/groups.decorator.js';

// TODO implement logic for handling different outcomes of file process and
// appropriate responses:
//Returns 200 (or 201) for success.
//Returns 400 for client-side errors like invalid input.
//Returns 500 or other server-side codes for external errors like OpenAI API issues.

@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  constructor(private readonly cvImportService: CvImportService) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Public()
  @Post('process/cvfiles')
  async importCv(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { user: string },
  ) {
    try {
      if (!body.user) {
        throw new BadRequestException('No user specified');
      }

      return await this.cvImportService.processFiles(files, body.user);
    } catch (BadRequestException) {
      return HttpStatus.BAD_REQUEST;
    }
  }
}
