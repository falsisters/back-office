"use server";

import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";
import { UserDataPayload } from "../../../utils/types/userData.type";

export const getUserData = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/auth/user`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occured"
    );
  }

  const payload: UserDataPayload = await response.json();
  return payload;
};
