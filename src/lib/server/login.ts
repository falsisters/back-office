"use server";

import { APIError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";
import { LoginFormData, LoginPayload } from "../../../utils/types/login.type";

export const login = async (formData: LoginFormData) => {
  const cookieStore = await cookies();
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(formData),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: APIError = await response.json();
    throw new Error(data.message);
  }

  const payload: LoginPayload = await response.json();

  cookieStore.set("token", payload.access_token);
  cookieStore.set("name", payload.name);

  return payload;
};
