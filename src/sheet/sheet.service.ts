import { Injectable, Logger } from '@nestjs/common';
import { SheetDataDTO, RowValueDTO, Month, StatusValue } from './dtos.js';
import { google, sheets_v4 } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SheetService {
  private sheets: sheets_v4.Sheets;
  private spreadSheetId: string;
  private logger = new Logger(SheetService.name);

  constructor(private configService: ConfigService) {
    const spreadsheet_id = this.configService.get<string>('SPREADSHEET_ID');

    if (!spreadsheet_id) {
      throw new Error('Spreadsheet id must be provided');
    }
    this.spreadSheetId = spreadsheet_id;
  }

  updateSheetsCredentials(access_token: string) {
    const token = access_token.replace('Bearer ', '').trim();
    const client = new google.auth.OAuth2();
    client.setCredentials({ access_token: token });
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
      const lastColumnLetter = this.getColumnLetter(totalColumns); // Convert column index to letter
      const dynamicRange = `Allocation!A1:${lastColumnLetter}${totalRows}`; // e.g., "A1:Z100"

      // Step 3: Fetch the sheet data for the determined range
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadSheetId, // The ID of the spreadsheet
        ranges: [dynamicRange], // Dynamically generated range
        includeGridData: true, // Include cell data for further processing
      });

      // Extract the sheet data from the response
      const sheetData = response.data.sheets?.[0];
      if (!sheetData || !sheetData.data || !sheetData.data[0].rowData) {
        throw new Error('No data found in sheet'); // Error if no data is found
      }

      const rows = sheetData.data[0].rowData; // Array of row data
      const colorData: Record<string, sheets_v4.Schema$Color> = {}; // Object to store cell color data

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
                const cellAddress = `${this.getColumnLetter(columnIndex + 1)}${rowIndex + 1}`;
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

  // Helper Function for Column Conversion
  // Google Sheets and Column Letters:
  //    Single letters: A, B, C, ..., Z (for columns 1 to 26)
  //    Double letters: AA, AB, ..., AZ, BA, BB, ..., ZZ (for columns 27 to 702)
  //    Triple letters: AAA, AAB, ..., ZZZ (for columns 703 and beyond)
  getColumnLetter(columnIndex: number): string {
    let letter = '';
    while (columnIndex > 0) {
      const remainder = (columnIndex - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      columnIndex = Math.floor((columnIndex - 1) / 26);
    }
    return letter;
  }

  async getCellStatus(
    colormap: Record<string, sheets_v4.Schema$Color>,
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
      this.logger.debug(
        `No color found for cell: ${cellAddress}. returning unavailable`,
      );
      return 'unavailable';
    }

    // Helper function to check if a color channel (red, green, blue) is within a tolerance range
    const isWithinTolerance = (
      actual: number | undefined,
      target: number,
      tolerance: number = 0.05,
    ) => Math.abs((actual ?? -1) - target) <= tolerance; // Use default value of -1 if actual is undefined

    // Helper function to compare an actual color to a target color within tolerance
    const matchesColor = (
      actualColor: sheets_v4.Schema$Color,
      targetColor: { red: number; green: number; blue: number },
    ) =>
      isWithinTolerance(actualColor.red ?? 0, targetColor.red) &&
      isWithinTolerance(actualColor.green ?? 0, targetColor.green) &&
      isWithinTolerance(actualColor.blue ?? 0, targetColor.blue);

    // Define the target colors with their respective RGB values
    const redColor = { red: 0.91764706, green: 0.2627451, blue: 0.20784314 };
    const yellowColor = { red: 0.9843137, green: 0.7372549, blue: 0.015686275 };
    const blueColor = { red: 0.27450982, green: 0.7411765, blue: 0.7764706 };
    const greyColor = { red: 0.8509804, green: 0.8509804, blue: 0.8509804 };
    const greenColor = { red: 0.20392157, green: 0.65882355, blue: 0.3254902 };

    if (matchesColor(color, redColor)) {
      return 'available'; // If red, the status is 'available'
    } else if (matchesColor(color, yellowColor)) {
      return 'unsure'; // If yellow, the status is 'unsure'
    } else if (matchesColor(color, blueColor)) {
      return 'flexible_start'; // If blue, the status is 'flexible_start'
    } else if (matchesColor(color, greyColor) && cellValue === '') {
      return 'unavailable'; // If grey and empty, the status is 'unavailable'
    } else if (matchesColor(color, greenColor) && cellValue === '1') {
      return 'unavailable'; // If green and has value 1, the status is 'unavailable'
    } else if (cellValue && cellValue !== '1') {
      return 'available'; // Available if the cell has a value other than '1'
    } else {
      return 'unavailable'; // Default status is 'unavailable'
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
          // Use the helper function to calculate the column letter
          const columnLetter = this.getColumnLetter(j + 1);
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
