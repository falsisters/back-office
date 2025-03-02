"use server";

import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";
import {
  RegisterFormData,
  RegisterPayload,
} from "../../../utils/types/register.type";

export const register = async (formData: RegisterFormData) => {
  const cookieStore = await cookies();
  const response = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(formData),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occured"
    );
  }

  const payload: RegisterPayload = await response.json();

  cookieStore.set("token", payload.access_token);
  cookieStore.set("name", payload.name);

  return payload;
};
