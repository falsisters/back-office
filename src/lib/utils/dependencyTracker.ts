import { extractCellReferences } from "./formulaParser";

export interface CellDependency {
  cellRef: string; // e.g., "A1", "Quantity2"
  dependsOn: string[]; // cells this formula depends on
  dependents: string[]; // cells that depend on this cell
}

export interface DependencyMap {
  [cellRef: string]: CellDependency;
}

/**
 * Builds a dependency map from sheet data
 */
export function buildDependencyMap(
  sheetData: any,
  sheetType: "kahon" | "inventory" = "kahon"
): DependencyMap {
  const dependencyMap: DependencyMap = {};

  if (!sheetData?.Rows) return dependencyMap;

  // Initialize all cells in the dependency map
  sheetData.Rows.forEach((row: any) => {
    row.Cells?.forEach((cell: any) => {
      const cellRef = getCellReference(
        row.rowIndex,
        cell.columnIndex,
        sheetType
      );

      if (!dependencyMap[cellRef]) {
        dependencyMap[cellRef] = {
          cellRef,
          dependsOn: [],
          dependents: [],
        };
      }

      // If cell has a formula, extract its dependencies
      if (cell.formula && cell.formula.startsWith("=")) {
        const dependencies = extractCellReferences(cell.formula);
        dependencyMap[cellRef].dependsOn = dependencies;

        // Add this cell as a dependent to all its dependencies
        dependencies.forEach((depRef) => {
          if (!dependencyMap[depRef]) {
            dependencyMap[depRef] = {
              cellRef: depRef,
              dependsOn: [],
              dependents: [],
            };
          }
          if (!dependencyMap[depRef].dependents.includes(cellRef)) {
            dependencyMap[depRef].dependents.push(cellRef);
          }
        });
      }
    });
  });

  return dependencyMap;
}

/**
 * Gets cell reference string based on sheet type
 */
function getCellReference(
  rowIndex: number,
  columnIndex: number,
  sheetType: "kahon" | "inventory"
): string {
  if (sheetType === "kahon") {
    // Kahon: 0=Quantity, 1=Name, 2=A, 3=B, etc.
    if (columnIndex === 0) return `Quantity${rowIndex}`;
    if (columnIndex === 1) return `Name${rowIndex}`;
    return `${String.fromCharCode(65 + columnIndex - 2)}${rowIndex}`;
  } else {
    // Inventory: 0=A, 1=B, 2=C, etc.
    return `${String.fromCharCode(65 + columnIndex)}${rowIndex}`;
  }
}

/**
 * Finds all cells that need to be recalculated when a given cell changes
 */
export function findDependentCells(
  changedCellRef: string,
  dependencyMap: DependencyMap
): string[] {
  const toRecalculate = new Set<string>();
  const visited = new Set<string>();

  function traverse(cellRef: string) {
    if (visited.has(cellRef)) return; // Prevent infinite loops
    visited.add(cellRef);

    const dependency = dependencyMap[cellRef];
    if (dependency) {
      dependency.dependents.forEach((dependent) => {
        toRecalculate.add(dependent);
        traverse(dependent); // Recursively find dependents of dependents
      });
    }
  }

  traverse(changedCellRef);
  return Array.from(toRecalculate);
}

/**
 * Orders cells for calculation based on dependencies (topological sort)
 */
export function getCalculationOrder(
  cellRefs: string[],
  dependencyMap: DependencyMap
): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: string[] = [];

  function visit(cellRef: string) {
    if (visiting.has(cellRef)) {
      // Circular dependency detected - skip this cell
      console.warn(`Circular dependency detected for cell: ${cellRef}`);
      return;
    }
    if (visited.has(cellRef)) return;

    visiting.add(cellRef);

    const dependency = dependencyMap[cellRef];
    if (dependency) {
      // Visit all dependencies first
      dependency.dependsOn.forEach((depRef) => {
        if (cellRefs.includes(depRef)) {
          visit(depRef);
        }
      });
    }

    visiting.delete(cellRef);
    visited.add(cellRef);
    result.push(cellRef);
  }

  cellRefs.forEach((cellRef) => {
    if (!visited.has(cellRef)) {
      visit(cellRef);
    }
  });

  return result;
}

/**
 * Resolves all formulas in the correct dependency order
 */
export function resolveAllFormulas(
  sheetData: any,
  sheetType: "kahon" | "inventory" = "kahon"
): Array<{
  rowIndex: number;
  columnIndex: number;
  cellId: string;
  newValue: string;
}> {
  const dependencyMap = buildDependencyMap(sheetData, sheetType);
  const formulaCells: string[] = [];
  const cellLookup: { [cellRef: string]: any } = {};

  // Collect all formula cells and create lookup
  sheetData.Rows?.forEach((row: any) => {
    row.Cells?.forEach((cell: any) => {
      const cellRef = getCellReference(
        row.rowIndex,
        cell.columnIndex,
        sheetType
      );
      cellLookup[cellRef] = {
        ...cell,
        rowIndex: row.rowIndex,
      };

      if (cell.formula && cell.formula.startsWith("=")) {
        formulaCells.push(cellRef);
      }
    });
  });

  // Get calculation order
  const calculationOrder = getCalculationOrder(formulaCells, dependencyMap);
  const updates: Array<{
    rowIndex: number;
    columnIndex: number;
    cellId: string;
    newValue: string;
  }> = [];

  // Resolve formulas in order
  calculationOrder.forEach((cellRef) => {
    const cell = cellLookup[cellRef];
    if (cell && cell.formula) {
      const newValue = evaluateFormulaWithDependencies(
        cell.formula,
        sheetData,
        cell.rowIndex,
        cell.columnIndex,
        sheetType
      );

      if (newValue !== cell.value) {
        updates.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          cellId: cell.id,
          newValue,
        });

        // Update the cell value in our local copy for subsequent calculations
        cell.value = newValue;
      }
    }
  });

  return updates;
}

/**
 * Enhanced formula evaluation with dependency awareness
 */
function evaluateFormulaWithDependencies(
  formula: string,
  sheetData: any,
  currentRow: number,
  currentCol: number,
  sheetType: "kahon" | "inventory"
): string {
  // Use existing formula evaluation functions
  if (sheetType === "inventory") {
    return require("./formulaParser").parseAndEvaluateInventoryFormula(
      formula,
      sheetData,
      currentRow,
      currentCol
    );
  } else {
    return require("./formulaParser").parseAndEvaluateFormula(
      formula,
      sheetData,
      currentRow,
      currentCol
    );
  }
}
