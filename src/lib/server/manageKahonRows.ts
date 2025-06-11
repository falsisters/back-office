"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NestApiError } from "../../../utils/types/error.type";
import {
  AddCalculationRowType,
  AddCalculationRowsType,
} from "../../../utils/types/kahon.type";

export const addKahonCalculationRow = async (data: AddCalculationRowType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Ensure we have the correct structure for the API
  const requestData = {
    sheetId: data.sheetId,
    inventoryId: data.inventoryId,
    rowIndex: data.rowIndex,
    description: data.description || "",
  };

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/calculation-row`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(requestData),
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to add calculation row"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const addKahonCalculationRows = async (data: AddCalculationRowsType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/calculation-rows`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to add calculation rows"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const deleteKahonRow = async (rowId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/row/${rowId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to delete row"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};
