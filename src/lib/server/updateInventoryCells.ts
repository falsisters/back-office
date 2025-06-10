"use server";

import { cookies } from "next/headers";
import type { InventoryCellOperationBatch } from "../../../utils/types/inventory.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { prepareCellForStorage } from "@/utils/formulaUtils";
import { revalidatePath } from "next/cache";

export const updateInventoryCells = async (
  payload: InventoryCellOperationBatch
) => {
  console.log("🚀 updateInventoryCells called with payload:", payload);

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      console.error("❌ No access token found");
      throw new Error("Unauthorized");
    }

    // Prepare cells for storage with proper formula handling
    const getCellValue = (col: number, row: number): string | number => {
      // This would ideally come from current sheet state
      // For now, return empty as formulas should be self-contained
      return "";
    };

    const processedCells = payload.cells.map((cell) => {
      if (cell.formula && cell.formula.startsWith("=")) {
        const prepared = prepareCellForStorage(cell, getCellValue);
        return {
          id: cell.id,
          value: prepared.value,
          formula: prepared.formula,
          color: cell.color,
        };
      }
      return {
        id: cell.id,
        value: cell.value || "",
        formula: cell.formula,
        color: cell.color,
      };
    });

    const transformedPayload = {
      cells: processedCells,
    };

    console.log("📦 Transformed payload:", transformedPayload);
    console.log(
      "🌐 Making request to:",
      `${process.env.API_URL}/inventory/user/cells`
    );

    const response = await fetch(
      `${process.env.API_URL}/inventory/user/cells`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: JSON.stringify(transformedPayload),
      }
    );

    // Important: Only try to parse JSON if the response status is OK
    let data;
    const responseText = await response.text();
    console.log("📥 Raw API Response:", responseText);

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      console.error("❌ Failed to parse response:", e);
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      console.error("❌ API error:", { status: response.status, data });
      throw new Error(
        Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Failed to update cells"
      );
    }

    console.log("✅ Successfully updated cells:", data);

    revalidatePath("/kahon");
    revalidatePath("/inventory");

    return data;
  } catch (error: unknown) {
    console.error("❌ Update cells error:", {
      name: error instanceof Error ? error.name : "Unknown error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
};
