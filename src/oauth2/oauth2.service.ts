import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { Oauth2ClientProvider } from './oauth2-client.provider';

@Injectable()
export class OAuth2Service {
  private readonly oauth2Client: OAuth2Client;

  constructor(private oauth2ClientProvider: Oauth2ClientProvider) {
    this.oauth2Client = this.oauth2ClientProvider.oauth2Client;
  }

  async getToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
}
