// src/utils/types/getUserSheetsByDate.type.ts
import { z } from "zod";
import {
  SheetSchema,
  RowSchema,
  CellSchema,
  KahonItemSchema,
  KahonSchema
} from "./schema.type";

export const GetUserSheetsByDatePayloadSchema = SheetSchema.extend({
  Rows: z.array(
    RowSchema.extend({
      Cells: z.array(CellSchema),
      item: KahonItemSchema.optional().nullable()
    })
  ),
  kahon: KahonSchema
});

export type GetUserSheetsByDatePayload = z.infer<
  typeof GetUserSheetsByDatePayloadSchema
>;

export const GetUserSheetsByDateParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type GetUserSheetsByDateParams = z.infer<
  typeof GetUserSheetsByDateParamsSchema
>;