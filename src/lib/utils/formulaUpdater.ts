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
 * Enhanced function to update all formulas when rows are reordered
 * Handles complex reordering scenarios and prevents index conflicts
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

  if (!sheetData?.Rows || rowMappings.length === 0) return formulaUpdates;

  // Create a comprehensive mapping including reverse mappings
  const forwardMap = new Map<number, number>();
  const reverseMap = new Map<number, number>();

  rowMappings.forEach(({ oldRowIndex, newRowIndex }) => {
    forwardMap.set(oldRowIndex, newRowIndex);
    reverseMap.set(newRowIndex, oldRowIndex);
  });

  console.log("Row mappings for formula updates:", {
    forward: Object.fromEntries(forwardMap),
    reverse: Object.fromEntries(reverseMap),
    mappings: rowMappings,
  });

  // Find rows that contain formulas and need updating
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
          // Use the current row index (which might be updated) for the formula update
          const currentRowIndex = forwardMap.get(row.rowIndex) || row.rowIndex;

          formulaUpdates.push({
            rowIndex: currentRowIndex, // Use the new row index
            columnIndex: cell.columnIndex,
            cellId: cell.id,
            oldFormula: cell.formula,
            newFormula: updatedFormula,
          });

          console.log(`Formula update needed for cell ${cell.id}:`, {
            originalRowIndex: row.rowIndex,
            currentRowIndex,
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

  // Sort reorders by their original row index to process them in order
  const sortedReorders = Array.from(pendingReorders.values()).sort(
    (a, b) => a.oldRowIndex - b.oldRowIndex
  );

  console.log("Creating row mappings from reorders:", sortedReorders);

  sortedReorders.forEach((reorder) => {
    mappings.push({
      oldRowIndex: reorder.oldRowIndex,
      newRowIndex: reorder.newRowIndex,
    });
  });

  // Validate that we don't have duplicate new row indices
  const newIndices = mappings.map((m) => m.newRowIndex);
  const duplicates = newIndices.filter(
    (item, index) => newIndices.indexOf(item) !== index
  );

  if (duplicates.length > 0) {
    console.error("Duplicate new row indices detected:", duplicates);
    console.error("Full mappings:", mappings);
  }

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

/**
 * Enhanced function to calculate proper row reordering without conflicts
 * Now includes proper index recalculation to avoid duplicates
 */
export function calculateRowReorderMappings(
  draggedRowId: string,
  draggedCurrentIndex: number,
  targetIndex: number,
  allRows: any[]
): Map<
  string,
  {
    id: string;
    rowId: string;
    oldRowIndex: number;
    newRowIndex: number;
    timestamp: number;
  }
> {
  const mappings = new Map();

  // Sort rows by current row index
  const sortedRows = [...allRows].sort((a, b) => a.rowIndex - b.rowIndex);

  console.log("Calculating row reorder mappings:", {
    draggedRowId,
    draggedCurrentIndex,
    targetIndex,
    totalRows: sortedRows.length,
    rowIndices: sortedRows.map((r) => `${r.id}:${r.rowIndex}`),
  });

  // Find the dragged row
  const draggedRowIndex = sortedRows.findIndex((r) => r.id === draggedRowId);
  if (draggedRowIndex === -1) {
    console.error("Could not find dragged row");
    return mappings;
  }

  // Validate target index
  if (targetIndex < 0 || targetIndex >= sortedRows.length) {
    console.error("Invalid target index:", targetIndex);
    return mappings;
  }

  // Don't reorder if dropping in the same position
  if (draggedRowIndex === targetIndex) {
    console.log("Row would end up in same position, no reordering needed");
    return mappings;
  }

  // Create new order by moving the dragged row
  const reorderedRows = [...sortedRows];
  const [draggedRow] = reorderedRows.splice(draggedRowIndex, 1);
  reorderedRows.splice(targetIndex, 0, draggedRow);

  // Recalculate all row indices sequentially to avoid conflicts
  const finalMappings = new Map();
  const usedNewIndices = new Set<number>();

  // First pass: assign new indices sequentially starting from 1
  reorderedRows.forEach((row, index) => {
    const newRowIndex = index + 1; // 1-based indexing
    const oldRowIndex = row.rowIndex;

    // Only create mapping if the row index actually changed
    if (newRowIndex !== oldRowIndex) {
      const mapping = {
        id: `reorder-${row.id}-${Date.now()}`,
        rowId: row.id,
        oldRowIndex: oldRowIndex,
        newRowIndex: newRowIndex,
        timestamp: Date.now(),
      };

      finalMappings.set(row.id, mapping);
      console.log(`Row ${row.id}: ${oldRowIndex} → ${newRowIndex}`);
    }

    // Track used indices to detect duplicates
    if (usedNewIndices.has(newRowIndex)) {
      console.error(`Duplicate new index detected: ${newRowIndex}`);
    }
    usedNewIndices.add(newRowIndex);
  });

  // Validation: ensure no duplicate new indices
  const newIndices = Array.from(finalMappings.values()).map(
    (m) => m.newRowIndex
  );
  const allNewIndices = [
    ...newIndices,
    ...sortedRows
      .filter((r) => !finalMappings.has(r.id))
      .map((r) => r.rowIndex),
  ];

  const duplicates = allNewIndices.filter(
    (item, index) => allNewIndices.indexOf(item) !== index
  );

  if (duplicates.length > 0) {
    console.error("Duplicate row indices would be created:", duplicates);
    console.error(
      "Final mappings that would cause issues:",
      Object.fromEntries(finalMappings)
    );

    // Clear mappings to prevent database corruption
    finalMappings.clear();
    throw new Error("Row reordering would create duplicate indices");
  }

  // Additional validation: ensure all indices are within valid range
  const maxExpectedIndex = sortedRows.length;
  const invalidIndices = newIndices.filter(
    (index) => index < 1 || index > maxExpectedIndex
  );

  if (invalidIndices.length > 0) {
    console.error("Invalid row indices detected:", invalidIndices);
    finalMappings.clear();
    throw new Error("Row reordering would create invalid indices");
  }

  console.log(
    "Generated validated row mappings:",
    Object.fromEntries(finalMappings)
  );
  console.log(
    "Used indices:",
    Array.from(usedNewIndices).sort((a, b) => a - b)
  );

  return finalMappings;
}

/**
 * Recalculates and fixes any duplicate or invalid row indices
 * This is a utility function to clean up row indices if they get corrupted
 */
export function recalculateRowIndices(rows: any[]): Map<
  string,
  {
    id: string;
    rowId: string;
    oldRowIndex: number;
    newRowIndex: number;
    timestamp: number;
  }
> {
  const mappings = new Map();

  // Sort rows by their current rowIndex
  const sortedRows = [...rows].sort((a, b) => a.rowIndex - b.rowIndex);

  console.log(
    "Recalculating row indices for:",
    sortedRows.map((r) => `${r.id}:${r.rowIndex}`)
  );

  // Assign sequential indices starting from 1
  sortedRows.forEach((row, index) => {
    const newRowIndex = index + 1;
    const oldRowIndex = row.rowIndex;

    if (newRowIndex !== oldRowIndex) {
      const mapping = {
        id: `recalc-${row.id}-${Date.now()}`,
        rowId: row.id,
        oldRowIndex: oldRowIndex,
        newRowIndex: newRowIndex,
        timestamp: Date.now(),
      };

      mappings.set(row.id, mapping);
      console.log(
        `Recalculated row ${row.id}: ${oldRowIndex} → ${newRowIndex}`
      );
    }
  });

  return mappings;
}

/**
 * Validates row mappings to ensure no conflicts
 */
export function validateRowMappings(
  mappings: Map<string, any>,
  existingRows: any[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Get all new indices from mappings
  const newIndices = Array.from(mappings.values()).map((m) => m.newRowIndex);

  // Get indices of rows that won't change
  const unchangedIndices = existingRows
    .filter((row) => !mappings.has(row.id))
    .map((row) => row.rowIndex);

  // Combine all final indices
  const allFinalIndices = [...newIndices, ...unchangedIndices];

  // Check for duplicates
  const duplicates = allFinalIndices.filter(
    (item, index) => allFinalIndices.indexOf(item) !== index
  );

  if (duplicates.length > 0) {
    errors.push(`Duplicate indices detected: ${duplicates.join(", ")}`);
  }

  // Check for invalid ranges
  const maxExpected = existingRows.length;
  const outOfRange = allFinalIndices.filter(
    (index) => index < 1 || index > maxExpected
  );

  if (outOfRange.length > 0) {
    errors.push(
      `Indices out of valid range (1-${maxExpected}): ${outOfRange.join(", ")}`
    );
  }

  // Check for gaps (optional - indices should be sequential)
  const sortedIndices = [...allFinalIndices].sort((a, b) => a - b);
  for (let i = 0; i < sortedIndices.length; i++) {
    if (sortedIndices[i] !== i + 1) {
      errors.push(
        `Gap detected in row sequence at index ${i + 1}, found ${
          sortedIndices[i]
        }`
      );
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
