"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export const getStorageUsage = async (): Promise<{
  total_size_bytes: number;
  total_size_readable: string;
}> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/storage/usage`, {
    headers,
    cache: "no-cache",
  });
  return response.json();
};

export const exportStorage = async (): Promise<string> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/storage/export`, {
    headers,
    cache: "no-cache",
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};

export const clearStorage = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/storage/clear`, {
    method: "DELETE",
    headers,
    cache: "no-cache",
  });
  return response.json();
};

export const getDatabaseUsage = async (): Promise<{
  total_size_bytes: number;
  total_size_readable: string;
}> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/storage/db-usage`, {
    headers,
    cache: "no-cache",
  });
  return response.json();
};
