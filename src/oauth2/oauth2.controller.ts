import { Controller, Get, Query, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { OAuth2Service } from './oauth2.service.js';
import { UnauthorizedException } from '@nestjs/common';
import { Public } from './groups.decorator.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('oauth')
@ApiTags('OAuth2')
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

  @Get('user/groups')
  @Public()
  @ApiOperation({
    summary: 'Get user groups',
    description: 'Retrieves the groups the user is part of',
  })
  async getRole(@Headers('authorization') authHeader: string) {
    try {
      console.log('Authorization header:', authHeader);
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header provided');
      }

      // Extract the access token from the Authorization header
      const accessToken = authHeader.replace('Bearer ', '');

      if (!accessToken) {
        throw new UnauthorizedException('No access token provided');
      }

      // Call the service method to get the user's role
      const groups = await this.oauthService.getUserGroups(accessToken);
      console.log('User groups:', groups);

      return {
        success: true,
        groups: groups.includes('manager') ? 'manager' : 'general',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Error retrieving role:', error);
      throw new UnauthorizedException('Failed to retrieve user role');
    }
  }
}
