// src/utils/types/sheet.type.ts

export interface EditCellsPayload {
  cells: Array<{
    id: string;
    value?: string;
    color?: string | null;
    formula?: string;
  }>;
}

export interface AddCellsPayload {
  cells: Array<{
    value: string;
    rowId: string;
    columnIndex: number;
    color?: string;
    formula?: string;
  }>;
}
