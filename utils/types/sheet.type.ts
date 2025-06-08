// src/utils/types/sheet.type.ts
import { z } from "zod";
import { SheetSchema, RowSchema, CellSchema, KahonItemSchema } from "./schema.type";

// Add Calculation Row
export const AddCalculationRowSchema = z.object({
  sheetId: z.string(),
  rowIndex: z.number()
});
export type AddCalculationRowPayload = z.infer<typeof AddCalculationRowSchema>;

// Add Calculation Rows
export const AddCalculationRowsSchema = z.object({
  sheetId: z.string(),
  rowIndexes: z.array(z.number())
});
export type AddCalculationRowsPayload = z.infer<typeof AddCalculationRowsSchema>;

// Add Item Row
export const AddItemRowSchema = z.object({
  sheetId: z.string(),
  kahonItemId: z.string(),
  rowIndex: z.number()
});
export type AddItemRowPayload = z.infer<typeof AddItemRowSchema>;

// Add Cell
export const AddCellSchema = z.object({
  rowId: z.string(),
  columnIndex: z.number(),
  value: z.string(),
  color: z.string().optional(),
  formula: z.string().optional()
});
export type AddCellPayload = z.infer<typeof AddCellSchema>;

// Add Cells
export const AddCellsSchema = z.object({
  cells: z.array(AddCellSchema)
});
export type AddCellsPayload = z.infer<typeof AddCellsSchema>;

// Edit Cell
export const EditCellSchema = z.object({
  id: z.string(),
  value: z.string(),
  formula: z.string().optional(),
  color: z.string().optional()
});
export type EditCellPayload = z.infer<typeof EditCellSchema>;

// Edit Cells
export const EditCellsSchema = z.object({
  cells: z.array(EditCellSchema)
});
export type EditCellsPayload = z.infer<typeof EditCellsSchema>;

// Sheet with Data
export const SheetWithDataSchema = SheetSchema.extend({
  Rows: z.array(
    RowSchema.extend({
      Cells: z.array(CellSchema),
      item: KahonItemSchema.optional().nullable()
    })
  )
});
export type SheetWithDataPayload = z.infer<typeof SheetWithDataSchema>;