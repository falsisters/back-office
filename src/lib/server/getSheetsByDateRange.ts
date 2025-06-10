// src/lib/server/getUserSheetsByDate.ts
"use server";

import { cookies } from "next/headers";
import type {
  GetUserSheetsByDatePayload,
  GetUserSheetsByDateParams,
} from "../../../utils/types/getSheetsByDateRange.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { resolveDisplayValue } from "@/utils/formulaUtils";

export const getUserSheetsByDate = async (
  params?: GetUserSheetsByDateParams
): Promise<GetUserSheetsByDatePayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const url = new URL(`${process.env.API_URL}/sheet/user/date`);

  if (params?.startDate) {
    url.searchParams.append("startDate", params.startDate);
  }

  if (params?.endDate) {
    url.searchParams.append("endDate", params.endDate);
  }

  const response = await fetch(url.toString(), {
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
        : error.message || "Failed to fetch sheets"
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
