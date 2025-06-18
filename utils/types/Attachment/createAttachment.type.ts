import { z } from "zod";
import { AttachmentTypeEnum } from "../schema.type";

export const CreateAttachmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: AttachmentTypeEnum,
  file: z.instanceof(File).refine((file) => file.size > 0, "File is required"),
});

export type CreateAttachmentType = z.infer<typeof CreateAttachmentSchema>;
