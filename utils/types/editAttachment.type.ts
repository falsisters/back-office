import { z } from "zod";

export const EditAttachmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters")
});

export type EditAttachmentType = z.infer<typeof EditAttachmentSchema>;