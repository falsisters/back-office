import { z } from "zod";
import { ProductResponseSchema } from "./getAllProductsByUserId.type";

export type GetProductByIdResponse = z.infer<typeof ProductResponseSchema>;