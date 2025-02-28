import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { GetCashierByIdPayload } from "../../../utils/types/getCashierById";

export const getCashierById = async (id: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/cashier/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    method: "GET",
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(data.message[0] || "Unexpected error occured");
  }

  const payload: GetCashierByIdPayload = await response.json();

  return payload;
};
