// src/utils/types/inventory.type.ts
import { z } from "zod";

// Base inventory cell schema
export const InventoryCellSchema = z.object({
  id: z.string(),
  columnIndex: z.number(),
  inventoryRowId: z.string(),
  color: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  isCalculated: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Inventory row schema
export const InventoryRowSchema = z.object({
  id: z.string(),
  rowIndex: z.number(),
  inventorySheetId: z.string(),
  isItemRow: z.boolean(),
  itemId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  Cells: z.array(InventoryCellSchema),
});

// Inventory sheet schema
export const InventorySheetSchema = z.object({
  id: z.string(),
  name: z.string(),
  inventoryId: z.string(),
  columns: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  Rows: z.array(InventoryRowSchema),
});

// Inventory schema
export const InventorySchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  InventorySheet: z.array(InventorySheetSchema).optional(),
});

// Export types
export type InventoryCell = z.infer<typeof InventoryCellSchema>;
export type InventoryRow = z.infer<typeof InventoryRowSchema>;
export type InventorySheet = z.infer<typeof InventorySheetSchema>;
export type Inventory = z.infer<typeof InventorySchema>;

// API payload types
export const AddInventoryCellPayloadSchema = z.object({
  rowId: z.string(),
  columnIndex: z.number(),
  value: z.string(),
  color: z.string().optional(),
  formula: z.string().optional(),
});

export const UpdateInventoryCellParamsSchema = z.object({
  value: z.string().optional(),
  color: z.string().optional(),
  formula: z.string().optional(),
});

export const InventoryCellOperationBatchSchema = z.object({
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

export const AddItemRowParamsSchema = z.object({
  sheetId: z.string(),
  inventoryItemId: z.string(),
  rowIndex: z.number(),
});

export const AddCalculationRowParamsSchema = z.object({
  inventoryId: z.string(),
  rowIndex: z.number(),
});

export const AddCalculationRowsParamsSchema = z.object({
  inventoryId: z.string(),
  rowIndexes: z.array(z.number()),
});

export type AddInventoryCellPayload = z.infer<
  typeof AddInventoryCellPayloadSchema
>;
export type UpdateInventoryCellParams = z.infer<
  typeof UpdateInventoryCellParamsSchema
>;
export type InventoryCellOperationBatch = z.infer<
  typeof InventoryCellOperationBatchSchema
>;
export type AddItemRowParams = z.infer<typeof AddItemRowParamsSchema>;
export type AddCalculationRowParams = z.infer<
  typeof AddCalculationRowParamsSchema
>;
export type AddCalculationRowsParams = z.infer<
  typeof AddCalculationRowsParamsSchema
>;

// Get inventory sheets by date range
export const GetInventorySheetsByDateParamsSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export type GetInventorySheetsByDateParams = z.infer<
  typeof GetInventorySheetsByDateParamsSchema
>;
export type GetInventorySheetPayload = InventorySheet | null;
