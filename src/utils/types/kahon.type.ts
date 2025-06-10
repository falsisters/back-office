import { z } from "zod";

// Row Operations
export const RowOperationSchema = z.object({
  sheetId: z.string(),
  rowIndex: z.number(),
});
export type RowOperation = z.infer<typeof RowOperationSchema>;

export const ItemRowOperationSchema = RowOperationSchema.extend({
  kahonItemId: z.string(),
});
export type ItemRowOperation = z.infer<typeof ItemRowOperationSchema>;

// Add calculation row operations
export const AddCalculationRowSchema = z.object({
  sheetId: z.string(),
  rowIndex: z.number(),
});
export type AddCalculationRow = z.infer<typeof AddCalculationRowSchema>;

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
