"use server";

import { cookies } from "next/headers";
import type { GetBillCountByIdPayload } from "../../../../utils/types/BillCount/getBillCountById.type";
import type { NestApiError } from "../../../../utils/types/error.type";

export const getBillCountById = async (
  id: string
): Promise<GetBillCountByIdPayload> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/bills/user/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to fetch bill count"
    );
  }

  const data = await response.json();

  // Convert date strings to Date objects and apply Manila timezone correction (UTC-8)
  const correctedDate = new Date(data.date);
  const manilaDate = new Date(correctedDate.getTime() - 8 * 60 * 60 * 1000);
  
  const correctedUpdatedAt = new Date(data.updatedAt);
  const manilaUpdatedAt = new Date(correctedUpdatedAt.getTime() - 8 * 60 * 60 * 1000);

  return {
    ...data,
    date: manilaDate,
    updatedAt: manilaUpdatedAt,
    bills: data.bills.map((bill: any) => {
      const correctedCreatedAt = new Date(bill.createdAt);
      const manilaCreatedAt = new Date(correctedCreatedAt.getTime() - 8 * 60 * 60 * 1000);
      
      const correctedBillUpdatedAt = new Date(bill.updatedAt);
      const manillaBillUpdatedAt = new Date(correctedBillUpdatedAt.getTime() - 8 * 60 * 60 * 1000);
      
      return {
        ...bill,
        createdAt: manilaCreatedAt,
        updatedAt: manillaBillUpdatedAt,
      };
    }),
  };
};
