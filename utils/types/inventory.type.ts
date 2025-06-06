// src/utils/types/inventory.type.ts
import { z } from "zod";
import {
  InventorySheetSchema,
  InventoryRowSchema,
  InventoryCellSchema,
  InventorySchema
} from "./schema.type";

export const GetInventorySheetPayloadSchema = InventorySheetSchema.extend({
  Rows: z.array(
    InventoryRowSchema.extend({
      Cells: z.array(InventoryCellSchema),
      item: InventorySchema.optional().nullable()
    })
  )
});

export type GetInventorySheetPayload = z.infer<typeof GetInventorySheetPayloadSchema>;

export const GetInventorySheetsByDateParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type GetInventorySheetsByDateParams = z.infer<
  typeof GetInventorySheetsByDateParamsSchema
>;

export const AddInventoryItemRowParamsSchema = z.object({
  sheetId: z.string(),
  inventoryItemId: z.string(),
  rowIndex: z.number()
});

export type AddInventoryItemRowParams = z.infer<typeof AddInventoryItemRowParamsSchema>;

export const AddInventoryCalculationRowParamsSchema = z.object({
  sheetId: z.string(),
  rowIndex: z.number(),
  description: z.string().optional()
});

export type AddInventoryCalculationRowParams = z.infer<
  typeof AddInventoryCalculationRowParamsSchema
>;

export const UpdateInventoryCellParamsSchema = z.object({
  cellId: z.string(),
  value: z.string(),
  formula: z.string().optional(),
  color: z.string().optional()
});

export type UpdateInventoryCellParams = z.infer<typeof UpdateInventoryCellParamsSchema>;