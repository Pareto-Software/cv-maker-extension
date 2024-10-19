import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OAuth2Service } from './oauth2.service';

@Controller('oauth')
export class AuthController {
  constructor(private readonly oauthService: OAuth2Service) {}

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      const tokens = await this.oauthService.getToken(code);
      console.log('Received OAuth token:', tokens);
      res.status(200).send('Authentication successful');
    } catch (error) {
      console.error('Error retrieving token:', error);
      res.status(500).send('Authentication failed');
    }
  }
}
