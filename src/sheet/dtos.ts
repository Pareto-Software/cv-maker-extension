export type StatusValue =
  | 'available'
  | 'unsure'
  | 'flexible_start'
  | 'unavailable';

export interface CellValueDTO {
  year: number;
  month: number;
  reservationPercentage: number;
  status: StatusValue;
}

export interface RowValueDTO {
  name: string;
  capacity: number;
  cells: CellValueDTO[];
}

export interface SheetDataDTO {
  rows: RowValueDTO[];
}
