import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable({ scope: Scope.REQUEST })
export class SheetsClientProvider {
  public sheetsOAuth2Client;
  public authMethod: string;
  public spreadSheetId: string;
  constructor(private configService: ConfigService) {
    const client_id = this.configService.get<string>('CLIENT_ID');
    const client_secret = this.configService.get<string>('CLIENT_SECRET');
    const redirect_url = this.configService.get<string>('REDIRECT_URL');
    const spreadsheet_id = this.configService.get<string>('SPREADSHEET_ID');

    if (!client_id || !client_secret || !redirect_url || !spreadsheet_id) {
      throw new Error('Google client id, secret and redirect url must be provided');
    } 
    this.sheetsOAuth2Client = new google.auth.OAuth2();
    this.spreadSheetId = spreadsheet_id;
  }
}
