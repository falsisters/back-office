import { z } from "zod";
import { AttachmentTypeEnum } from "./schema.type";

export const EditAttachmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  type: AttachmentTypeEnum.optional(),
});

export type EditAttachmentType = z.infer<typeof EditAttachmentSchema>;