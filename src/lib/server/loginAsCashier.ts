"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { CreateCashierFormData } from "../../../utils/types/createCashier.type";
import { LoginAsCashierPayload } from "../../../utils/types/loginAsCashier.type";

export const createCashier = async (formData: CreateCashierFormData) => {
  const cookieStore = await cookies();
  const response = await fetch(`${process.env.API_URL}/cashier/`, {
    method: "POST",
    body: JSON.stringify(formData),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(data.message[0] || "Unexpected error occured");
  }

  const payload: LoginAsCashierPayload = await response.json();

  cookieStore.set("access_token", payload.access_token);

  return response.json();
};
