"use server";

import { cookies } from "next/headers";
import type { GetInventorySheetPayload } from "../../../utils/types/inventory.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { resolveDisplayValue } from "@/utils/formulaUtils";

export const getInventorySheetWithData = async (
  sheetId: string
): Promise<GetInventorySheetPayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/sheet/${sheetId}`, {
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
        : error.message || "Failed to fetch inventory sheet data"
    );
  }

  const sheetData = await response.json();

  // Process formulas for display
  if (sheetData?.Rows) {
    const getCellValue = (col: number, row: number): string | number => {
      const cell = sheetData.Rows?.[row]?.Cells?.find((c: any) => c.columnIndex === col);
      return cell?.value || "";
    };

    sheetData.Rows.forEach((row: any) => {
      row.Cells.forEach((cell: any) => {
        if (cell.formula && cell.formula.startsWith("=")) {
          // Resolve the display value for formulas
          cell.displayValue = resolveDisplayValue(cell, getCellValue);
        }
      });
    });
  }

  return sheetData;
};
