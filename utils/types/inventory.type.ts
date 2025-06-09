// src/utils/types/inventory.type.ts
import { z } from "zod";
import {
  InventorySheetSchema,
  InventoryRowSchema,
  InventoryCellSchema,
  InventorySchema
} from "./schema.type";

// Sheet Data
export const GetInventorySheetPayloadSchema = InventorySheetSchema.extend({
  Rows: z.array(
    InventoryRowSchema.extend({
      Cells: z.array(InventoryCellSchema),
      item: InventorySchema.optional().nullable()
    })
  )
});
export type GetInventorySheetPayload = z.infer<typeof GetInventorySheetPayloadSchema>;

// Date Range Params
export const GetInventorySheetsByDateParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});
export type GetInventorySheetsByDateParams = z.infer<typeof GetInventorySheetsByDateParamsSchema>;

// Cell Operations
export const InventoryCellOperationSchema = z.object({
  id: z.string().optional(), // For updates
  rowId: z.string().optional(), // For new cells
  columnIndex: z.number().optional(),
  value: z.string(),
  color: z.string().optional(),
  formula: z.string().optional()
});
export type InventoryCellOperation = z.infer<typeof InventoryCellOperationSchema>;

// Batch Cell Operations
export const InventoryCellOperationBatchSchema = z.object({
  cells: z.array(InventoryCellOperationSchema)
});
export type InventoryCellOperationBatch = z.infer<typeof InventoryCellOperationBatchSchema>;

// Row Operations
export const AddItemRowParamsSchema = z.object({
  sheetId: z.string(),
  inventoryItemId: z.string(),
  rowIndex: z.number()
});
export type AddItemRowParams = z.infer<typeof AddItemRowParamsSchema>;

export const AddCalculationRowParamsSchema = z.object({
  sheetId: z.string(),
  rowIndex: z.number(),
  description: z.string().optional()
});
export type AddCalculationRowParams = z.infer<typeof AddCalculationRowParamsSchema>;

export const AddCalculationRowsParamsSchema = z.object({
  sheetId: z.string(),
  rowIndexes: z.array(z.number())
});
export type AddCalculationRowsParams = z.infer<typeof AddCalculationRowsParamsSchema>;

export const UpdateInventoryCellParamsSchema = z.object({
  cellId: z.string(),
  value: z.string(),
  formula: z.string().optional(),
  color: z.string().optional()
});
export type UpdateInventoryCellParams = z.infer<typeof UpdateInventoryCellParamsSchema>;