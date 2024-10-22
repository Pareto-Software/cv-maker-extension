import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable({ scope: Scope.REQUEST })
export class Oauth2ClientProvider {
  public oauth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');
    const redirectUrl = this.configService.get<string>('REDIRECT_URL');

    if (!clientId || !clientSecret || !redirectUrl) {
      throw new Error('Client id, secret and redirect url must be provided');
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
  }
}
