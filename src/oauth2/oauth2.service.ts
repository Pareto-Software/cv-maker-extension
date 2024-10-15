import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class OAuth2Service {
  private readonly oauth2Client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID; // Set your client ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET; // Set your client secret
    const redirectUrl = process.env.REDIRECT_URL; // Set your redirect URL

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
  }

  async getToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
}
