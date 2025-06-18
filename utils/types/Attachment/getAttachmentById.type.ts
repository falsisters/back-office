import { z } from "zod";
import { AttachmentSchema } from "../schema.type";

export const GetAttachmentByIdPayloadSchema = AttachmentSchema;

export type GetAttachmentByIdPayload = z.infer<
  typeof GetAttachmentByIdPayloadSchema
>;
