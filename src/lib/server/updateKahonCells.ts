// src/lib/server/updateKahonCells.ts
"use server";

import { cookies } from "next/headers";
import type { EditCellsPayload } from "../../../utils/types/sheet.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { prepareCellForKahonStorage } from "@/utils/formulaUtils";
import { revalidatePath } from "next/cache";

export const updateKahonCells = async (payload: EditCellsPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Prepare cells for storage with proper formula handling and rounding for Kahon
  const getCellValue = (col: number, row: number): string | number => {
    // This would ideally come from current sheet state
    // For now, return empty as formulas should be self-contained
    return "";
  };

  const processedCells = payload.cells.map((cell) => {
    if (cell.formula && cell.formula.startsWith("=")) {
      const prepared = prepareCellForKahonStorage(cell, getCellValue);
      return {
        id: cell.id,
        value: prepared.value,
        formula: prepared.formula,
        color: cell.color,
      };
    }
    return cell;
  });

  const response = await fetch(`${process.env.API_URL}/sheet/user/cells`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify({ cells: processedCells }),
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
  return response.json();
};
