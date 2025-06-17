import { getColumnName, getColumnIndex } from "./formulaParser";

/**
 * Represents a row mapping from old position to new position
 */
export interface RowMapping {
  oldRowIndex: number;
  newRowIndex: number;
}

/**
 * Updates formula references when rows are reordered
 * @param formula Original formula string
 * @param rowMappings Array of row position changes
 * @param sheetType Type of sheet for proper column handling
 * @returns Updated formula string
 */
export function updateFormulaForRowReorder(
  formula: string,
  rowMappings: RowMapping[],
  sheetType: "kahon" | "inventory" = "kahon"
): string {
  if (!formula || !formula.startsWith("=")) {
    return formula;
  }

  // Create a mapping object for quick lookup
  const rowMap = new Map<number, number>();
  rowMappings.forEach(({ oldRowIndex, newRowIndex }) => {
    rowMap.set(oldRowIndex, newRowIndex);
  });

  let updatedFormula = formula;

  if (sheetType === "kahon") {
    // Kahon formulas can have Quantity1, Name1, A1, B1, etc.
    const kahonCellRegex = /\b(Quantity|Name|[A-Z]+)(\d+)\b/g;

    updatedFormula = updatedFormula.replace(
      kahonCellRegex,
      (match, column, rowStr) => {
        const oldRowIndex = parseInt(rowStr);
        const newRowIndex = rowMap.get(oldRowIndex);

        if (newRowIndex !== undefined) {
          return `${column}${newRowIndex}`;
        }
        return match;
      }
    );
  } else {
    // Inventory formulas have A1, B1, C1, etc.
    const inventoryCellRegex = /\b([A-Z]+)(\d+)\b/g;

    updatedFormula = updatedFormula.replace(
      inventoryCellRegex,
      (match, column, rowStr) => {
        const oldRowIndex = parseInt(rowStr);
        const newRowIndex = rowMap.get(oldRowIndex);

        if (newRowIndex !== undefined) {
          return `${column}${newRowIndex}`;
        }
        return match;
      }
    );
  }

  return updatedFormula;
}

/**
 * Updates all formulas in sheet data when rows are reordered
 * @param sheetData Sheet data containing rows and cells
 * @param rowMappings Array of row position changes
 * @param sheetType Type of sheet for proper column handling
 * @returns Array of formula updates to be applied
 */
export function updateAllFormulasForRowReorder(
  sheetData: any,
  rowMappings: RowMapping[],
  sheetType: "kahon" | "inventory" = "kahon"
): Array<{
  rowIndex: number;
  columnIndex: number;
  cellId: string;
  oldFormula: string;
  newFormula: string;
}> {
  const formulaUpdates: Array<{
    rowIndex: number;
    columnIndex: number;
    cellId: string;
    oldFormula: string;
    newFormula: string;
  }> = [];

  if (!sheetData?.Rows) return formulaUpdates;

  // Find rows that contain formulas
  sheetData.Rows.forEach((row: any) => {
    row.Cells?.forEach((cell: any) => {
      if (cell.formula && cell.formula.startsWith("=")) {
        const updatedFormula = updateFormulaForRowReorder(
          cell.formula,
          rowMappings,
          sheetType
        );

        // Only add to updates if the formula actually changed
        if (updatedFormula !== cell.formula) {
          formulaUpdates.push({
            rowIndex: row.rowIndex,
            columnIndex: cell.columnIndex,
            cellId: cell.id,
            oldFormula: cell.formula,
            newFormula: updatedFormula,
          });
        }
      }
    });
  });

  return formulaUpdates;
}

/**
 * Creates row mappings from pending row reorders
 * @param pendingReorders Map of pending row reorders
 * @returns Array of row mappings
 */
export function createRowMappingsFromReorders(
  pendingReorders: Map<string, any>
): RowMapping[] {
  const mappings: RowMapping[] = [];

  pendingReorders.forEach((reorder) => {
    mappings.push({
      oldRowIndex: reorder.oldRowIndex,
      newRowIndex: reorder.newRowIndex,
    });
  });

  return mappings;
}

/**
 * Checks if a formula contains any row references that would be affected by reordering
 * @param formula Formula string to check
 * @param affectedRows Array of row indices that are being moved
 * @returns true if formula would be affected
 */
export function isFormulaAffectedByRowReorder(
  formula: string,
  affectedRows: number[]
): boolean {
  if (!formula || !formula.startsWith("=")) {
    return false;
  }

  const rowRegex = /\b(?:Quantity|Name|[A-Z]+)(\d+)\b/g;
  let match;

  while ((match = rowRegex.exec(formula)) !== null) {
    const rowIndex = parseInt(match[1]);
    if (affectedRows.includes(rowIndex)) {
      return true;
    }
  }

  return false;
}
