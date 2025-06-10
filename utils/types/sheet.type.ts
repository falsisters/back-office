// src/utils/types/sheet.type.ts
import { z } from "zod";

// Base cell schema
export const CellSchema = z.object({
  id: z.string(),
  columnIndex: z.number(),
  rowId: z.string(),
  color: z.string().nullable().optional(),
  kahonItemId: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  isCalculated: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Row schema
export const RowSchema = z.object({
  id: z.string(),
  rowIndex: z.number(),
  sheetId: z.string(),
  isItemRow: z.boolean(),
  itemId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  Cells: z.array(CellSchema),
});

// Sheet schema
export const SheetSchema = z.object({
  id: z.string(),
  name: z.string(),
  kahonId: z.string(),
  columns: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  Rows: z.array(RowSchema),
});

// Kahon schema
export const KahonSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  Sheets: z.array(SheetSchema).optional(),
});

// Export types
export type Cell = z.infer<typeof CellSchema>;
export type Row = z.infer<typeof RowSchema>;
export type Sheet = z.infer<typeof SheetSchema>;
export type Kahon = z.infer<typeof KahonSchema>;

// API payload types
export const AddCellPayloadSchema = z.object({
  rowId: z.string(),
  columnIndex: z.number(),
  value: z.string(),
  color: z.string().optional(),
  formula: z.string().optional(),
});

export const EditCellPayloadSchema = z.object({
  value: z.string().optional(),
  color: z.string().optional(),
  formula: z.string().optional(),
});

export const EditCellsPayloadSchema = z.object({
  cells: z.array(
    z.object({
      id: z.string(),
      value: z.string().optional(),
      color: z.string().optional(),
      formula: z.string().optional(),
    })
  ),
});

export const AddCellsPayloadSchema = z.object({
  cells: z.array(AddCellPayloadSchema),
});

export const AddCalculationRowPayloadSchema = z.object({
  sheetId: z.string(),
  rowIndex: z.number(),
});

export const AddCalculationRowsPayloadSchema = z.object({
  sheetId: z.string(),
  rowIndexes: z.array(z.number()),
});

export type AddCellPayload = z.infer<typeof AddCellPayloadSchema>;
export type EditCellPayload = z.infer<typeof EditCellPayloadSchema>;
export type EditCellsPayload = z.infer<typeof EditCellsPayloadSchema>;
export type AddCellsPayload = z.infer<typeof AddCellsPayloadSchema>;
export type AddCalculationRowPayload = z.infer<
  typeof AddCalculationRowPayloadSchema
>;
export type AddCalculationRowsPayload = z.infer<
  typeof AddCalculationRowsPayloadSchema
>;

// Response types
export type SheetWithDataPayload = Sheet;
export type GetSheetsByDateResponse = Sheet | null;
