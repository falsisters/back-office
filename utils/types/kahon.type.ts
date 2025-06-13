import { z } from "zod";
import {
  SheetSchema,
  InventorySheetSchema,
  RowSchema,
  InventoryRowSchema,
  CellSchema,
  InventoryCellSchema,
} from "./schema.type";

// Extended schemas with relations
export const SheetWithDataSchema = SheetSchema.extend({
  Rows: z.array(
    RowSchema.extend({
      Cells: z.array(CellSchema),
    })
  ),
});

export const InventorySheetWithDataSchema = InventorySheetSchema.extend({
  Rows: z.array(
    InventoryRowSchema.extend({
      Cells: z.array(InventoryCellSchema),
    })
  ),
});

// Response schemas for user endpoints
export const CashierSheetResponseSchema = z.object({
  cashierName: z.string(),
  cashierId: z.string(),
  sheet: SheetWithDataSchema.nullable(),
});

export const CashierInventorySheetResponseSchema = z.object({
  cashierName: z.string(),
  cashierId: z.string(),
  sheet: InventorySheetWithDataSchema.nullable(),
});

// DTO schemas for operations
export const AddCalculationRowSchema = z.object({
  sheetId: z.string().optional(),
  inventoryId: z.string().optional(),
  rowIndex: z.number().int(),
  description: z.string().optional(),
});

export const AddCalculationRowsSchema = z.object({
  sheetId: z.string().optional(),
  inventoryId: z.string().optional(),
  rowIndexes: z.array(z.number().int()),
});

export const AddCellSchema = z.object({
  rowId: z.string(),
  columnIndex: z.number().int(),
  value: z.string(),
  color: z.string().optional(),
  formula: z.string().optional(),
  rowIndex: z.number().int().optional(), // Added rowIndex for row position updates
});

export const UpdateCellSchema = z.object({
  id: z.string(),
  value: z.string(),
  color: z.string().optional(),
  formula: z.string().optional(),
  rowIndex: z.number().int().optional(), // Added rowIndex for row position updates
});

export const AddCellsSchema = z.object({
  cells: z.array(AddCellSchema),
});

export const UpdateCellsSchema = z.object({
  cells: z.array(UpdateCellSchema),
});

// Date range query schema
export const DateRangeQuerySchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .transform((data) => {
    // Default to current day if no dates provided
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return {
      startDate: data.startDate || todayStr,
      endDate: data.endDate || todayStr,
    };
  });

// Color picker schema
export const ColorPickerSchema = z.object({
  cellId: z.string(),
  color: z.string(),
});

// Change tracking types
export const PendingCellChangeSchema = z.object({
  id: z.string(), // Unique identifier for the change
  rowId: z.string().optional(),
  rowIndex: z.number(),
  columnIndex: z.number(),
  cellId: z.string().optional(), // Existing cell ID if updating
  oldValue: z.string(),
  newValue: z.string(),
  formula: z.string().nullable().optional(), // Allow null values
  color: z.string().nullable().optional(), // Allow null values
  changeType: z.enum(["add", "update"]),
  timestamp: z.number(),
  isFormulaChange: z.boolean().default(false),
  newRowIndex: z.number().optional(), // Added for row position changes
});

export const BatchUpdateRequestSchema = z.object({
  changes: z.array(PendingCellChangeSchema),
  sheetId: z.string().optional(),
  inventoryId: z.string().optional(),
});

// Export types
export type SheetWithData = z.infer<typeof SheetWithDataSchema>;
export type InventorySheetWithData = z.infer<
  typeof InventorySheetWithDataSchema
>;
export type CashierSheetResponse = z.infer<typeof CashierSheetResponseSchema>;
export type CashierInventorySheetResponse = z.infer<
  typeof CashierInventorySheetResponseSchema
>;
export type AddCalculationRowType = z.infer<typeof AddCalculationRowSchema>;
export type AddCalculationRowsType = z.infer<typeof AddCalculationRowsSchema>;
export type AddCellType = z.infer<typeof AddCellSchema>;
export type UpdateCellType = z.infer<typeof UpdateCellSchema>;
export type AddCellsType = z.infer<typeof AddCellsSchema>;
export type UpdateCellsType = z.infer<typeof UpdateCellsSchema>;
export type DateRangeQueryType = z.infer<typeof DateRangeQuerySchema>;
export type ColorPickerType = z.infer<typeof ColorPickerSchema>;
export type PendingCellChange = z.infer<typeof PendingCellChangeSchema>;
export type BatchUpdateRequest = z.infer<typeof BatchUpdateRequestSchema>;
