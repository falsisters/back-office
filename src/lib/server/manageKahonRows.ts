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

  // Ensure we have the correct structure for multiple rows
  const requestData = {
    sheetId: data.sheetId,
    rowIndexes: data.rowIndexes,
  };

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/calculation-rows`,
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

export const updateKahonRowPosition = async (
  rowId: string,
  newRowIndex: number
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/row/${rowId}/position`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify({ rowIndex: newRowIndex }),
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to update row position"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const batchUpdateKahonRowPositions = async (
  updates: Array<{ rowId: string; newRowIndex: number }>
) => {
  console.log("batchUpdateKahonRowPositions called with:", updates);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    console.error("No access token found");
    throw new Error("Unauthorized");
  }

  const requestBody = { updates };
  console.log("Sending request to API with body:", requestBody);
  console.log("API URL:", `${process.env.API_URL}/sheet/user/rows/positions`);

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/rows/positions`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log("API response status:", response.status);
  console.log(
    "API response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API error response text:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      console.error("Parsed API error:", error);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to update row positions"
      );
    } catch (parseError) {
      console.error("Failed to parse error response:", parseError);
      throw new Error(
        `Failed to update row positions: ${response.status} ${response.statusText}`
      );
    }
  }

  const result = await response.json();
  console.log("API success response:", result);

  revalidatePath("/kahon");
  return result;
};
