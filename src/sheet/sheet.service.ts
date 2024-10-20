import { Injectable } from '@nestjs/common';
import {
  SheetDataDTO,
  RowValueDTO,
  Month,
  StatusValue,
} from './dtos';
import { SheetsClientProvider } from './sheets-client.provider';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class SheetService {
  private client;
  private sheets: sheets_v4.Sheets;
  private spreadSheetId: string;

  constructor(private sheetsClientProvider: SheetsClientProvider) {
    this.client = this.sheetsClientProvider.sheetsOAuth2Client;
    this.spreadSheetId = this.sheetsClientProvider.spreadSheetId;
  }

  updateSheetsCredentials(access_token: string) {
    const token = access_token.replace('Bearer ', '').trim();
    this.client.setCredentials({
    access_token: token,
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.client });
  }

  async getSheetColorData() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadSheetId,
        ranges: ['Allocation!A1:Z20'], // Limit to first 20 rows
        includeGridData: true,
      });

      const sheet = response.data.sheets?.[0];
      if (!sheet || !sheet.data || !sheet.data[0].rowData) {
        throw new Error('No data found in sheet');
      }

      const rows = sheet.data[0].rowData;
      const colorData: { [key: string]: sheets_v4.Schema$Color } = {};

      rows.forEach((row: sheets_v4.Schema$RowData, rowIndex: number) => {
        if (row.values) {
          row.values.forEach(
            (cell: sheets_v4.Schema$CellData, columnIndex: number) => {
              const backgroundColor = cell.userEnteredFormat?.backgroundColor;

              if (
                backgroundColor &&
                (backgroundColor.red !== 1 ||
                  backgroundColor.green !== 1 ||
                  backgroundColor.blue !== 1)
              ) {
                const cellAddress = `${String.fromCharCode(65 + columnIndex)}${rowIndex + 1}`;
                colorData[cellAddress] = backgroundColor;
              }
            },
          );
        }
      });

      return colorData;
    } catch (error) {
      console.error('Error fetching sheet color data:', error);
      throw new Error('Failed to fetch sheet color data');
    }
  }

  // have to put the color map also as undefined
  async getCellStatus(
    colormap: { [key: string]: sheets_v4.Schema$Color },
    cellAddress: string,
    cellValue: string,
  ) {
    // color map looks like this:
    // {
    //   A1: { red: 0.91764706, green: 0.2627451, blue: 0.20784314 },
    //   A2: { red: 0.9843137, green: 0.7372549, blue: 0.015686275 },
    //   A3: { red: 0.27450982, green: 0.7411765, blue: 0.7764706 },
    const color = colormap[cellAddress];
    if (!color) {
      console.log(
        'No color found for cell:',
        cellAddress,
        'returning unavailable',
      );
      return 'unavailable';
    }

    if (
      color.red === 0.91764706 &&
      color.green === 0.2627451 &&
      color.blue === 0.20784314
    ) {
      // red
      return 'available';
    } else if (
      color.red === 0.9843137 &&
      color.green === 0.7372549 &&
      color.blue === 0.015686275
    ) {
      // yellow
      return 'unsure';
    } else if (
      color.red === 0.27450982 &&
      color.green === 0.7411765 &&
      color.blue === 0.7764706
    ) {
      // blue
      return 'flexible_start';
    } else if (
      color.red === 0.8509804 &&
      color.green === 0.8509804 &&
      color.blue === 0.8509804 &&
      cellValue === ''
    ) {
      // grey and empty
      return 'unavailable';
    } else if (
      color.red === 0.20392157 &&
      color.green === 0.65882355 &&
      color.blue === 0.3254902 &&
      cellValue === '1'
    ) {
      // green and has value 1
      return 'unavailable';
    } else if (cellValue && cellValue !== '1') {
      // if something else, but still under capacity
      return 'available';
    } else {
      return 'unavailable'; // default
    }
  }

  // fills in years so we can access the year based on the column index
  appendYears(years: string[]): string[] {
    const res: string[] = [];
    let currentYear = '';
    let endingYearCount = 0;

    for (const year of years) {
      if (year) {
        res.push(year);
        currentYear = year;
        endingYearCount = 1;
        continue;
      }
      endingYearCount += 1;
      res.push(currentYear);
    }

    for (let i = 0; i < 12 - endingYearCount; i++) {
      res.push(currentYear);
    }
    return res;
  }

  async getSheetData(access_token: string): Promise<SheetDataDTO> {
    try {
      this.updateSheetsCredentials(access_token);
      console.log('sheetid:', this.spreadSheetId);
      const colormap = await this.getSheetColorData(); // get color data
      // get the actual data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadSheetId,
        range: 'Allocation',
      });

      if (!response.data.values) {
        throw new Error('No data values found');
      }

      const sheetData: SheetDataDTO = { rows: [] };
      const YearRow = this.appendYears(response.data.values[0]);
      const MonthRow = response.data.values[1];
      for (let i = 2; i < response.data.values.length; i++) {
        // notice the empty row after employees
        if (response.data.values[i].length < 2) {
          break;
        }
        const row = response.data.values[i];

        const rowValue: RowValueDTO = {
          name: row[0],
          capacity: Number(row[1]),
          cells: [],
        };

        for (let j = 2; j < row.length; j++) {
          const cellValue: string = row[j];
          // Calculate the cell address, e.g., "A3", "B5"
          const columnLetter = String.fromCharCode(65 + j); // 65 is ASCII for 'A'
          const rowNumber = i + 1;
          const cellAddress = `${columnLetter}${rowNumber}`;
          // getting the status of the cell
          const status = await this.getCellStatus(
            colormap,
            cellAddress,
            cellValue,
          );
          // filling in the row cell
          rowValue.cells.push({
            year: Number(YearRow[j]),
            month: MonthRow[j] as Month,
            reservationPercentage: cellValue === '' ? 0 : Number(cellValue),
            status: status as StatusValue,
          });
        }

        sheetData.rows.push(rowValue);
      }

      return sheetData;
    } catch (error) {
      console.error('Error fetching data:', error);
      return {} as SheetDataDTO;
    }
  }
}
