"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NestApiError } from "../../../utils/types/error.type";
import {
  AddCalculationRowType,
  AddCalculationRowsType,
} from "../../../utils/types/kahon.type";

export const addInventoryCalculationRow = async (data: {
  inventoryId: string;
  rowIndex: number;
  description?: string;
}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Ensure we have the correct structure for the API
  const requestData = {
    inventoryId: data.inventoryId,
    rowIndex: data.rowIndex,
    description: data.description || "",
  };

  console.log("Adding inventory calculation row with data:", requestData);
  console.log("API URL:", `${process.env.API_URL}/inventory/user/calculation-row`);

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/calculation-row`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(requestData),
    }
  );

  console.log("Response status:", response.status);
  console.log("Response headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to add inventory calculation row:", errorText);
    console.error("Request data was:", requestData);

    try {
      const error: NestApiError = JSON.parse(errorText);
      console.error("Parsed error:", error);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to add calculation row"
      );
    } catch (parseError) {
      console.error("Could not parse error response:", parseError);
      throw new Error(
        `Failed to add calculation row: ${response.status} ${response.statusText}. Response: ${errorText}`
      );
    }
  }

  const result = await response.json();
  console.log("Successfully added inventory calculation row:", result);
  revalidatePath("/kahon");
  return result;
};

export const addInventoryCalculationRows = async (
  data: AddCalculationRowsType
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Ensure we have the correct structure for multiple rows
  const requestData = {
    inventoryId: data.inventoryId,
    rowIndexes: data.rowIndexes,
  };

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/calculation-rows`,
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

export const deleteInventoryRow = async (rowId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/row/${rowId}`,
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

export const updateInventoryRowPosition = async (
  rowId: string,
  newRowIndex: number
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/row/${rowId}/position`,
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

export const batchUpdateInventoryRowPositions = async (
  updates: Array<{ rowId: string; newRowIndex: number }>
) => {
  console.log("batchUpdateInventoryRowPositions called with:", updates);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    console.error("No access token found");
    throw new Error("Unauthorized");
  }

  const requestBody = { updates };
  console.log("Sending request to inventory API with body:", requestBody);
  console.log(
    "API URL:",
    `${process.env.API_URL}/inventory/user/rows/positions`
  );

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/rows/positions`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log("Inventory API response status:", response.status);
  console.log(
    "Inventory API response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Inventory API error response text:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      console.error("Parsed inventory API error:", error);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to update row positions"
      );
    } catch (parseError) {
      console.error("Failed to parse inventory error response:", parseError);
      throw new Error(
        `Failed to update row positions: ${response.status} ${response.statusText}`
      );
    }
  }

  const result = await response.json();
  console.log("Inventory API success response:", result);

  revalidatePath("/kahon");
  return result;
};

// Alternative function that uses sheet ID instead of inventory ID
export const addInventoryCalculationRowBySheetId = async (data: {
  sheetId: string;
  rowIndex: number;
  description?: string;
}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Try using sheetId instead of inventoryId
  const requestData = {
    sheetId: data.sheetId,
    rowIndex: data.rowIndex,
    description: data.description || "",
  };

  console.log("Adding inventory calculation row by sheet ID with data:", requestData);

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/calculation-row`,
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
    const errorText = await response.text();
    console.error("Failed to add inventory calculation row by sheet ID:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to add calculation row"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to add calculation row: ${response.status} ${response.statusText}`
      );
    }
  }

  revalidatePath("/kahon");
  return await response.json();
};
