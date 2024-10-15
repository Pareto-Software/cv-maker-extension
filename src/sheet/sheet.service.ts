import { Injectable } from '@nestjs/common';
import { SheetDataDTO } from './dtos';
import { SheetsClientProvider } from './sheets-client.provider';
const {google} = require('googleapis');

@Injectable()
export class SheetService {
  private client;
  private spreadSheetId: string;
  private authMethod: string;
  private apiKey: string;

  constructor(private sheetsClientProvider: SheetsClientProvider) {
    this.client = this.sheetsClientProvider.sheetsOAuth2Client;
    this.spreadSheetId = this.sheetsClientProvider.spreadSheetId;
    this.authMethod = this.sheetsClientProvider.authMethod;
    this.apiKey = this.sheetsClientProvider.apiKey;
  }

  getSheets(access_token: string) {
    if (this.authMethod === "api_key"){
        console.log("Using api key:", this.apiKey);
        return google.sheets({ version: 'v4', auth: this.apiKey });
    } else {
        console.log("Using OAuth");
        this.client.setCredentials({
            access_token: access_token,
        });
        return google.sheets({ version: 'v4', auth: this.client });
    }
  }

  async getSheetData(access_token: string): Promise<SheetDataDTO> {
    try {
      const sheets = this.getSheets(access_token);
      console.log("sheetid:",this.spreadSheetId);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadSheetId,
        range: 'Allocation',
      });
      console.log("response:", response.data.values);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    return {} as any;
  }

}
