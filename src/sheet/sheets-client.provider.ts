import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable({ scope: Scope.REQUEST })
export class SheetsClientProvider {
  public sheetsOAuth2Client;
  public authMethod: string;
  public apiKey: string;
  public spreadSheetId: string;
  constructor(private configService: ConfigService) {
    const client_id = this.configService.get<string>('CLIENT_ID');
    const client_secret = this.configService.get<string>('CLIENT_SECRET');
    const redirect_url = this.configService.get<string>('REDIRECT_URL');
    const spreadsheet_id = this.configService.get<string>('SPREADSHEET_ID');
    const api_key = this.configService.get<string>('GOOGLE_API_KEY');
    const auth_method = this.configService.get<string>('AUTH_METHOD');

    if (
      !client_id ||
      !client_secret ||
      !redirect_url ||
      !auth_method ||
      !spreadsheet_id
    ) {
      throw new Error(
        'Google client id, secret and redirect url must be provided',
      );
    }
    if (auth_method === 'api_key') {
      if (!api_key) {
        throw new Error(
          'When auth method is set to api_key, an api key must be provided',
        );
      } else {
        this.apiKey = api_key;
      }
    }
    this.sheetsOAuth2Client = new google.auth.OAuth2();
    this.authMethod = auth_method;
    this.spreadSheetId = spreadsheet_id;
  }
}
