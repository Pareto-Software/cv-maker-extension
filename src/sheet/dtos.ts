export type StatusValue =
  | 'available'
  | 'unsure'
  | 'flexible_start'
  | 'unavailable';

export type Month =
  | 'Jan'
  | 'Feb'
  | 'Mar'
  | 'Apr'
  | 'May'
  | 'Jun'
  | 'Jul'
  | 'Aug'
  | 'Sep'
  | 'Oct'
  | 'Nov'
  | 'Dec';

export interface CellValueDTO {
  year: number;
  month: Month;
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
