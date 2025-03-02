"use server";

import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";
import { LoginFormData, LoginPayload } from "../../../utils/types/login.type";

export const login = async (formData: LoginFormData) => {
  const cookieStore = await cookies();
  const response = await fetch(`${process.env.API_URL}/auth`, {
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

  const payload: LoginPayload = await response.json();

  cookieStore.set("access_token", payload.access_token);
  cookieStore.set("name", payload.name);

  return payload;
};
