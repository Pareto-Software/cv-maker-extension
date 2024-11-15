import { Injectable } from '@nestjs/common';
import { SheetDataDTO, RowValueDTO, Month, StatusValue } from './dtos';
import { google, sheets_v4 } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SheetService {
  private sheets: sheets_v4.Sheets;
  private spreadSheetId: string;

  constructor(private configService: ConfigService) {
    const spreadsheet_id = this.configService.get<string>('SPREADSHEET_ID');

    if (!spreadsheet_id) {
      throw new Error(
        'Google client id, secret and redirect url must be provided',
      );
    }
    this.spreadSheetId = spreadsheet_id;
  }

  updateSheetsCredentials(access_token: string) {
    const token = access_token.replace('Bearer ', '').trim();
    const client = new google.auth.OAuth2();
    client.setCredentials({ access_token: token });
    console.log('setting credentials: ', token);
    this.sheets = google.sheets({ version: 'v4', auth: client });
  }

  async getSheetColorData() {
    try {
      // Step 1: Fetch the sheet metadata to determine the total rows and columns
      const metadataResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadSheetId, // The ID of the spreadsheet
        includeGridData: false, // We only need metadata here, not the actual data
      });

      // Find the specific sheet by its title (e.g., "Allocation")
      const sheet = metadataResponse.data.sheets?.find(
        (s) => s.properties?.title === 'Allocation',
      );

      // Validate that the sheet exists and has grid properties
      if (!sheet || !sheet.properties || !sheet.properties.gridProperties) {
        throw new Error('Failed to fetch sheet properties'); // Error if sheet data is invalid
      }

      // Extract the total rows and columns from grid properties
      const totalRows = sheet.properties.gridProperties.rowCount || 0;
      const totalColumns = sheet.properties.gridProperties.columnCount || 0;

      // Step 2: Construct a dynamic range string based on rows and columns
      const lastColumnLetter = String.fromCharCode(64 + totalColumns); // Convert column index to letter
      const dynamicRange = `Allocation!A1:${lastColumnLetter}${totalRows}`; // e.g., "A1:Z100"

      // Step 3: Fetch the sheet data for the determined range
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadSheetId, // The ID of the spreadsheet
        ranges: [dynamicRange], // Dynamically generated range
        includeGridData: true, // Include cell data for further processing
      });

      // console.log('response:', JSON.stringify(response, null, 2));

      // Extract the sheet data from the response
      const sheetData = response.data.sheets?.[0];
      if (!sheetData || !sheetData.data || !sheetData.data[0].rowData) {
        throw new Error('No data found in sheet'); // Error if no data is found
      }

      const rows = sheetData.data[0].rowData; // Array of row data
      const colorData: { [key: string]: sheets_v4.Schema$Color } = {}; // Object to store cell color data

      // Step 4: Process each row and cell to extract background colors
      rows.forEach((row: sheets_v4.Schema$RowData, rowIndex: number) => {
        if (row.values) {
          row.values.forEach(
            (cell: sheets_v4.Schema$CellData, columnIndex: number) => {
              // Extract the cell's background color if available
              const backgroundColor = cell.userEnteredFormat?.backgroundColor;

              // Only store cells with non-default background color (not white)
              if (
                backgroundColor &&
                (backgroundColor.red !== 1 ||
                  backgroundColor.green !== 1 ||
                  backgroundColor.blue !== 1)
              ) {
                // Convert columnIndex to column letter (e.g., 0 -> A, 1 -> B)
                const cellAddress = `${String.fromCharCode(65 + columnIndex)}${rowIndex + 1}`;
                colorData[cellAddress] = backgroundColor; // Add to colorData object
              }
            },
          );
        }
      });

      // Return the collected color data
      return colorData;
    } catch (error) {
      console.error('Error fetching sheet color data:', error);
      throw new Error('Failed to fetch sheet color data'); // Rethrow error with a custom message
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
      console.log('response:', response.data);

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

      // print the sheet data
      for (const row of sheetData.rows) {
        console.log('Row:', row.name);
        for (const cell of row.cells) {
          console.log(
            `Year: ${cell.year}, Month: ${cell.month}, Status: ${cell.status}`,
          );
        }
      }
      console.log('leaving sheet service');
      return sheetData;
    } catch (error) {
      console.error('Error fetching data:', error);
      return {} as SheetDataDTO;
    }
  }
}
