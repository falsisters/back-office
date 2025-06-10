// src/utils/types/kahon.type.ts
import { z } from "zod";
import {
  SheetSchema,
  RowSchema,
  CellSchema,
  KahonItemSchema,
} from "./schema.type";

// Common types
export const DateRangeParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type DateRangeParams = z.infer<typeof DateRangeParamsSchema>;

// Sheet Data
export const SheetWithDataSchema = SheetSchema.extend({
  Rows: z.array(
    RowSchema.extend({
      Cells: z.array(CellSchema),
      item: KahonItemSchema.optional().nullable(),
    })
  ),
});
export type SheetWithData = z.infer<typeof SheetWithDataSchema>;

// Cell Operations
export const CellOperationSchema = z.object({
  id: z.string().optional(), // For updates, we need cell ID
  rowId: z.string().optional(), // For new cells, we need rowId
  columnIndex: z.number().optional(), // For new cells
  value: z.string().optional(),
  color: z.string().optional(),
  formula: z.string().optional(),
});
export type CellOperation = z.infer<typeof CellOperationSchema>;

// Batch Cell Operations
export const CellOperationBatchSchema = z.object({
  cells: z.array(
    z.object({
      id: z.string().optional(), // For updates
      rowId: z.string().optional(), // For new cells
      columnIndex: z.number().optional(), // For new cells
      value: z.string().optional(),
      color: z.string().optional(),
      formula: z.string().optional(),
    })
  ),
});
export type CellOperationBatch = z.infer<typeof CellOperationBatchSchema>;

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
