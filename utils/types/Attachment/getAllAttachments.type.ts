import { z } from "zod";
import { AttachmentSchema } from "./schema.type";

export const GetAllAttachmentsPayloadSchema = z.array(AttachmentSchema);

export type GetAllAttachmentsPayload = z.infer<
  typeof GetAllAttachmentsPayloadSchema
>;