import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('oauth')
@ApiTags('OAuth2')
export class AuthController {
  @Get('callback')
  async callback(@Res() res: Response) {
    try {
      res.status(200).send('Authentication successful');
    } catch (error) {
      console.error('Error retrieving token:', error);
      res.status(500).send('Authentication failed');
    }
  }
}
