"use server";

import { revalidatePath } from "next/cache";
import { UpdateBillCountType } from "../../../../utils/types/BillCount/editBillCount.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const editBillCount = async (
  id: string,
  formData: UpdateBillCountType
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/bills/user/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to update bill count");
  }

  revalidatePath("/");
  return await response.json();
};
