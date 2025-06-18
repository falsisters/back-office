"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  AddCellType,
  AddCellsType,
  UpdateCellsType,
} from "../../../../utils/types/kahon.type";

// Kahon Cells
export const addKahonCell = async (data: AddCellType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sheet/user/cell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to add cell"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const addKahonCells = async (data: AddCellsType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sheet/user/cells`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to add cells"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const updateKahonCell = async (
  cellId: string,
  data: Omit<AddCellType, "rowId" | "columnIndex"> & { rowIndex?: number }
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Properly handle the formula field - ensure it's sent as string or null, not undefined
  const sanitizedData = {
    value: data.value || "",
    formula: data.formula === undefined ? null : data.formula, // Convert undefined to null
    color: data.color === undefined ? null : data.color, // Convert undefined to null
    rowIndex: data.rowIndex,
  };

  console.log("updateKahonCell - cellId:", cellId);
  console.log("updateKahonCell - original data:", data);
  console.log("updateKahonCell - sanitizedData:", sanitizedData);

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/cell/${cellId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(sanitizedData),
    }
  );

  console.log("updateKahonCell - response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("updateKahonCell - API error text:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to update cell"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to update cell: ${response.status} ${response.statusText}`
      );
    }
  }

  const result = await response.json();
  console.log("updateKahonCell - success result:", result);
  revalidatePath("/kahon");
  return result;
};

export const updateKahonCells = async (data: UpdateCellsType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sheet/user/cells`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to update cells"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const deleteKahonCell = async (cellId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/cell/${cellId}`,
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
        : error.message || "Failed to delete cell"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

// Inventory Cells
export const addInventoryCell = async (data: AddCellType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/user/cell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to add cell"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const addInventoryCells = async (data: AddCellsType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/user/cells`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to add cells"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const updateInventoryCell = async (
  cellId: string,
  data: Omit<AddCellType, "rowId" | "columnIndex"> & { rowIndex?: number }
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Properly handle the formula field - ensure it's sent as string or null, not undefined
  const sanitizedData = {
    value: data.value || "",
    formula: data.formula === undefined ? null : data.formula, // Convert undefined to null
    color: data.color === undefined ? null : data.color, // Convert undefined to null
    rowIndex: data.rowIndex,
  };

  console.log("updateInventoryCell - cellId:", cellId);
  console.log("updateInventoryCell - original data:", data);
  console.log("updateInventoryCell - sanitizedData:", sanitizedData);

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/cell/${cellId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(sanitizedData),
    }
  );

  console.log("updateInventoryCell - response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("updateInventoryCell - API error text:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to update cell"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to update cell: ${response.status} ${response.statusText}`
      );
    }
  }

  const result = await response.json();
  console.log("updateInventoryCell - success result:", result);
  revalidatePath("/kahon");
  return result;
};

export const updateInventoryCells = async (data: UpdateCellsType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/user/cells`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to update cells"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

export const deleteInventoryCell = async (cellId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/cell/${cellId}`,
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
        : error.message || "Failed to delete cell"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
};

// Batch update functions for Kahon
export const batchUpdateKahonCells = async (changes: any[]) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Sanitize the changes data to ensure proper formula handling
  const sanitizedChanges = changes.map((change) => ({
    ...change,
    formula: change.formula === undefined ? null : change.formula,
    color: change.color === undefined ? null : change.color,
  }));

  console.log("batchUpdateKahonCells - original changes:", changes);
  console.log("batchUpdateKahonCells - sanitized changes:", sanitizedChanges);

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/cells/batch`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify({ changes: sanitizedChanges }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("batchUpdateKahonCells - API error:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to batch update cells"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to batch update cells: ${response.status} ${response.statusText}`
      );
    }
  }

  const result = await response.json();
  console.log("batchUpdateKahonCells - success result:", result);
  revalidatePath("/kahon");
  return result;
};

// Batch update functions for Inventory
export const batchUpdateInventoryCells = async (changes: any[]) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Sanitize the changes data to ensure proper formula handling
  const sanitizedChanges = changes.map((change) => ({
    ...change,
    formula: change.formula === undefined ? null : change.formula,
    color: change.color === undefined ? null : change.color,
  }));

  console.log("batchUpdateInventoryCells - original changes:", changes);
  console.log(
    "batchUpdateInventoryCells - sanitized changes:",
    sanitizedChanges
  );

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/cells/batch`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify({ changes: sanitizedChanges }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("batchUpdateInventoryCells - API error:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to batch update cells"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to batch update cells: ${response.status} ${response.statusText}`
      );
    }
  }

  const result = await response.json();
  console.log("batchUpdateInventoryCells - success result:", result);
  revalidatePath("/kahon");
  return result;
};
