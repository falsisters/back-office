"use server";

import { cookies } from "next/headers";
import {
  LoginFormData,
  LoginPayload,
  NestApiError,
} from "../../../utils/types/login.type";

/**
 * Server action for user login
 * @param formData Login credentials
 * @returns Login payload with access token and user info
 */
export const login = async (formData: LoginFormData) => {
  const cookieStore = cookies();
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
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
        : data.message || "Unexpected error occurred"
    );
  }

  const payload: LoginPayload = await response.json();

  (await cookieStore).set("access_token", payload.access_token);
  (await cookieStore).set("name", payload.name);
  if (payload.permissions) {
    (await cookieStore).set("permissions", JSON.stringify(payload.permissions));
  }

  return payload;
};
