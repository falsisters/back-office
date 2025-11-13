"use server";

import { revalidatePath } from "next/cache";
import { UpdateBillCountType } from "../../../../utils/types/BillCount/editBillCount.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const editCashierBillCount = async (
  cashierId: string,
  billCountId: string,
  formData: UpdateBillCountType
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  console.log("🔄 BILL COUNT EDIT - Sending data to backend:", {
    cashierId,
    billCountId,
    formData,
    apiUrl: `${process.env.API_URL}/bills/cashier/${cashierId}/${billCountId}`
  });

  const response = await fetch(
    `${process.env.API_URL}/bills/cashier/${cashierId}/${billCountId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    console.error("❌ BILL COUNT EDIT - Backend error:", error);
    throw new Error(error.message?.toString() || "Failed to update bill count");
  }

  const result = await response.json();
  console.log("✅ BILL COUNT EDIT - Backend response:", {
    summaryStep1: result?.summaryStep1,
    summaryFinal: result?.summaryFinal,
    beginningBalance: result?.beginningBalance,
    showBeginningBalance: result?.showBeginningBalance
  });

  revalidatePath("/");
  return result;
};
