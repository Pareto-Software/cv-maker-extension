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
import { JwtGuard } from 'src/jwt/jwt.guard';

// Manages HTTP requests and routing.
@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  @UseInterceptors(FilesInterceptor('files'))
  @Post('process/cvfiles')
  async importCv(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { user: string },
    //@Req() request: Request,
  ) {
    console.log('Processing CV files');
    if (body.user) {
      console.log(body.user);
      console.log(files);
    }

    // Do something with the user id and files
    // Validate them?
    // Send them for langchain parsing?

    try {
      // await this.cvImportService.importCv(createCvDto);
      return HttpStatus.NO_CONTENT; // 204
    } catch (error) {
      throw new HttpException(
        `Failed to import CV ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR, //500
      );
    }
  }
}
