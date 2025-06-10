export interface ItemRowOperation {
  sheetId: string;
  kahonItemId: string;
  rowIndex: number;
}

export interface RowOperation {
  sheetId: string;
  rowIndex: number;
}

export interface CellOperation {
  value: string;
  id?: string; // For updates
  color?: string | null; // Allow null for removing colors
  rowId?: string; // For new cells
  columnIndex?: number; // For new cells
  formula?: string;
}

export interface CellOperationBatch {
  cells: CellOperation[];
}

export interface KahonItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  total?: number;
}

export interface KahonSheet {
  id: string;
  name: string;
  date: string;
  userId: string;
  items: KahonItem[];
}
