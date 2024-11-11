import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/jwt/jwt.guard';

// Manages HTTP requests and routing.
@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  // Should handle the flow so that it can return 400 or 500 depending on what
  // goes wrong
  @Post('process/cvfiles')
  // Should perhaps import a CV DTO inside the ()
  async importCv() {
    console.log('Processing CV files');
    try {
      // await this.cvImportService.importCv(createCvDto);
      return HttpStatus.NO_CONTENT;
    } catch (error) {
      throw new HttpException(
        `Failed to import CV ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
