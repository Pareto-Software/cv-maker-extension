import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

// Manages HTTP requests and routing.
@Controller('cv-import')
@UseGuards(JwtGuard)
export class CvImportController {
  // Should handle the flow so that it can return 400 or 500 depending on what
  // goes wrong
  @Post('process/cvfiles')
  // Should perhaps import a CV DTO inside the ()
  async importCv() {
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
