"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NestApiError } from "../../../utils/types/error.type";
import {
  AddCellType,
  AddCellsType,
  UpdateCellsType,
} from "../../../utils/types/kahon.type";

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
  data: Omit<AddCellType, "rowId" | "columnIndex">
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Convert null color to undefined to match type expectations
  const sanitizedData = {
    ...data,
    color: data.color === null ? undefined : data.color,
  };

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

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to update cell"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
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
  data: Omit<AddCellType, "rowId" | "columnIndex">
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Convert null color to undefined to match type expectations
  const sanitizedData = {
    ...data,
    color: data.color === null ? undefined : data.color,
  };

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

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to update cell"
    );
  }

  revalidatePath("/kahon");
  return await response.json();
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
