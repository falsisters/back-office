import { z } from "zod";

export const UserDataPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(4),
  id: z.string(),
});
export type UserDataPayload = z.infer<typeof UserDataPayloadSchema>;
