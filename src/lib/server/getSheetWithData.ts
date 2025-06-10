// src/lib/server/getSheetWithData.ts
"use server";

import { cookies } from "next/headers";
import type { SheetWithDataPayload } from "../../../utils/types/sheet.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { resolveDisplayValue } from "@/utils/formulaUtils";

export const getSheetWithData = async (
  sheetId: string
): Promise<SheetWithDataPayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sheet/${sheetId}`, {
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
        : error.message || "Failed to fetch sheet data"
    );
  }

  const sheetData = await response.json();

  // Process formulas for display
  if (sheetData?.Rows) {
    const getCellValue = (col: number, row: number): string | number => {
      const cell = sheetData.Rows?.[row]?.Cells?.[col];
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
