"use server";

import { revalidatePath } from "next/cache";
import { CreateBillCountType } from "../../../../utils/types/BillCount/createBillCount.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const createCashierBillCount = async (
  cashierId: string,
  formData: CreateBillCountType
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/bills/cashier/${cashierId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to create bill count");
  }

  revalidatePath("/");
  return await response.json();
};
