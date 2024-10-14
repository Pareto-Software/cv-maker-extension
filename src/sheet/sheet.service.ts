import { Injectable } from '@nestjs/common';
import { SheetDataDTO } from './dtos';

@Injectable()
export class SheetService {
  /**
   * TODO: This will return the sheet data
   */
  async getSheetData(): Promise<SheetDataDTO> {
    return {} as any;
  }
}
