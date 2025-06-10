export interface CellReference {
  col: number;
  row: number;
}

export function parseCellReference(ref: string): CellReference {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);

  const [, colStr, rowStr] = match;
  const col =
    colStr
      .split("")
      .reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
  const row = parseInt(rowStr) - 1;

  return { col, row };
}

export function getCellReference(col: number, row: number): string {
  let colStr = "";
  let c = col;
  while (c >= 0) {
    colStr = String.fromCharCode(65 + (c % 26)) + colStr;
    c = Math.floor(c / 26) - 1;
  }
  return `${colStr}${row + 1}`;
}

export function parseFormula(formula: string): string[] {
  // Extract cell references from formula (e.g., A1, B2, etc.)
  const cellRefs = formula.match(/[A-Z]+\d+/g) || [];
  return cellRefs;
}

export function evaluateFormula(
  formula: string,
  getCellValue: (col: number, row: number) => string | number
): number | string {
  try {
    let processedFormula = formula.slice(1); // Remove '=' prefix

    // Replace cell references with actual values
    const cellRefs = parseFormula(formula);
    cellRefs.forEach((ref) => {
      const { col, row } = parseCellReference(ref);
      const value = getCellValue(col, row);
      const numValue =
        typeof value === "string" ? parseFloat(value) || 0 : value;
      processedFormula = processedFormula.replace(
        new RegExp(ref, "g"),
        numValue.toString()
      );
    });

    // Basic formula evaluation (supports +, -, *, /, parentheses)
    // This is a simplified implementation - in production, use a proper formula parser
    const result = Function(`"use strict"; return (${processedFormula})`)();
    return typeof result === "number" && !isNaN(result) ? result : "#ERROR!";
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR!";
  }
}

export function findDependentCells(
  formula: string,
  allCells: Array<{ col: number; row: number; formula?: string }>
): CellReference[] {
  const cellRefs = parseFormula(formula);
  const dependents: CellReference[] = [];

  allCells.forEach((cell) => {
    if (cell.formula && cell.formula.startsWith("=")) {
      const cellFormula = parseFormula(cell.formula);
      const hasReference = cellRefs.some((ref) => cellFormula.includes(ref));
      if (hasReference) {
        dependents.push({ col: cell.col, row: cell.row });
      }
    }
  });

  return dependents;
}
