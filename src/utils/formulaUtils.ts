export interface CellReference {
  col: number;
  row: number;
}

// Convert column number to letter (0 = A, 1 = B, etc.)
export function columnToLetter(col: number): string {
  let result = "";
  while (col >= 0) {
    result = String.fromCharCode((col % 26) + 65) + result;
    col = Math.floor(col / 26) - 1;
  }
  return result;
}

// Convert letter to column number (A = 0, B = 1, etc.)
export function letterToColumn(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1;
}

// Get Excel-style cell reference (A1, B2, etc.)
export function getCellReference(col: number, row: number): string {
  return `${columnToLetter(col)}${row + 1}`;
}

// Parse Excel-style cell reference (A1 -> {col: 0, row: 0})
export function parseCellReference(cellRef: string): CellReference {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${cellRef}`);
  }

  const col = letterToColumn(match[1]);
  const row = parseInt(match[2]) - 1;

  return { col, row };
}

// Convert jspreadsheet internal reference to Excel reference
export function jspreadsheetToExcel(cellName: string): string {
  // jspreadsheet uses format like "col_f2" for column F, row 2
  const match = cellName.match(/^col_([a-z])(\d+)$/i);
  if (!match) {
    // If it doesn't match the expected pattern, try to extract column and row differently
    const altMatch = cellName.match(/^([A-Z]+)(\d+)$/);
    if (altMatch) {
      return cellName; // Already in Excel format
    }
    throw new Error(`Cannot convert jspreadsheet reference: ${cellName}`);
  }

  const colLetter = match[1].toUpperCase();
  const rowNum = match[2];

  return `${colLetter}${rowNum}`;
}

// Convert Excel reference to jspreadsheet internal reference
export function excelToJspreadsheet(excelRef: string): string {
  const { col, row } = parseCellReference(excelRef);
  const colLetter = columnToLetter(col).toLowerCase();
  return `col_${colLetter}${row}`;
}

// Parse formula to extract all cell references
export function parseFormula(formula: string): string[] {
  if (!formula.startsWith("=")) {
    return [];
  }

  // Match Excel-style cell references (A1, B2, etc.)
  const cellRefRegex = /\b[A-Z]+\d+\b/g;
  const matches = formula.match(cellRefRegex);

  return matches || [];
}

// Parse SUM formula range (e.g., SUM(A1:A5))
export function parseSUMRange(
  formula: string
): { start: string; end: string } | null {
  const match = formula.match(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/);
  if (!match) return null;

  return {
    start: match[1],
    end: match[2],
  };
}

// Database compatibility: Convert stored value vs formula
export function resolveDisplayValue(
  cell: { value?: string | null; formula?: string | null },
  getCellValue: (col: number, row: number) => string | number
): string {
  // If cell has a formula, always evaluate it for display
  if (cell.formula && cell.formula.startsWith("=")) {
    try {
      const result = evaluateFormula(cell.formula, getCellValue);
      return result.toString();
    } catch (error) {
      console.error("Formula evaluation error:", error);
      return "#ERROR!";
    }
  }

  // Otherwise return the stored value
  return cell.value || "";
}

// Database compatibility: Prepare cell data for storage
export function prepareCellForStorage(
  cellData: {
    value?: string;
    formula?: string;
    color?: string;
  },
  getCellValue: (col: number, row: number) => string | number
): {
  value: string;
  formula?: string;
  color?: string;
} {
  const isFormula = cellData.formula && cellData.formula.startsWith("=");

  if (isFormula) {
    // For formulas, store the evaluated result as value
    try {
      const evaluatedValue = evaluateFormula(cellData.formula!, getCellValue);
      return {
        value: evaluatedValue.toString(),
        formula: cellData.formula,
        color: cellData.color,
      };
    } catch (error) {
      return {
        value: "#ERROR!",
        formula: cellData.formula,
        color: cellData.color,
      };
    }
  } else {
    // For regular values, store as-is
    return {
      value: cellData.value || "",
      formula: undefined,
      color: cellData.color,
    };
  }
}

// KahonSheets-specific cell preparation with rounding down
export function prepareCellForKahonStorage(
  cellData: {
    value?: string;
    formula?: string;
    color?: string;
  },
  getCellValue: (col: number, row: number) => string | number
): {
  value: string;
  formula?: string;
  color?: string;
} {
  const isFormula = cellData.formula && cellData.formula.startsWith("=");

  if (isFormula) {
    // For formulas, store the evaluated result as value (rounded down for Kahon)
    try {
      const evaluatedValue = evaluateFormula(cellData.formula!, getCellValue);
      // Round down to whole number if it's a numeric result
      const numericValue = parseFloat(String(evaluatedValue));
      const finalValue = !isNaN(numericValue)
        ? Math.floor(numericValue).toString()
        : evaluatedValue.toString();

      return {
        value: finalValue,
        formula: cellData.formula,
        color: cellData.color,
      };
    } catch (error) {
      return {
        value: "#ERROR!",
        formula: cellData.formula,
        color: cellData.color,
      };
    }
  } else {
    // For regular values, store as-is
    return {
      value: cellData.value || "",
      formula: undefined,
      color: cellData.color,
    };
  }
}

// Enhanced formula evaluation with better error handling
export function evaluateFormula(
  formula: string,
  getCellValue: (col: number, row: number) => string | number
): number | string {
  if (!formula.startsWith("=")) {
    return formula;
  }

  try {
    let expression = formula.substring(1); // Remove the '=' sign

    // Handle SUM function with range
    expression = handleSUMFunction(expression, getCellValue);

    // Handle AVERAGE function
    expression = handleAVERAGEFunction(expression, getCellValue);

    // Handle COUNTA function
    expression = handleCOUNTAFunction(expression, getCellValue);

    // Handle COUNT function (count numeric values)
    expression = handleCOUNTFunction(expression, getCellValue);

    // Handle MAX function
    expression = handleMAXFunction(expression, getCellValue);

    // Handle MIN function
    expression = handleMINFunction(expression, getCellValue);

    // Replace individual cell references with their values
    expression = replaceCellReferences(expression, getCellValue);

    // Evaluate the mathematical expression safely
    const result = evaluateMathExpression(expression);

    return isNaN(result) ? "#ERROR!" : result;
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR!";
  }
}

// Helper functions for different Excel functions
function handleSUMFunction(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const sumMatch = expression.match(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/g);
  if (sumMatch) {
    for (const sumFormula of sumMatch) {
      const range = parseSUMRange(`=${sumFormula}`);
      if (range) {
        const sum = calculateRangeSum(range, getCellValue);
        expression = expression.replace(sumFormula, sum.toString());
      }
    }
  }
  return expression;
}

function handleAVERAGEFunction(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const avgMatch = expression.match(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/g);
  if (avgMatch) {
    for (const avgFormula of avgMatch) {
      const range = parseSUMRange(`=${avgFormula.replace("AVERAGE", "SUM")}`);
      if (range) {
        const { sum, count } = calculateRangeSumAndCount(range, getCellValue);
        const average = count > 0 ? sum / count : 0;
        expression = expression.replace(avgFormula, average.toString());
      }
    }
  }
  return expression;
}

function handleCOUNTAFunction(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const countMatch = expression.match(/COUNTA\(([A-Z]+\d+):([A-Z]+\d+)\)/g);
  if (countMatch) {
    for (const countFormula of countMatch) {
      const range = parseSUMRange(`=${countFormula.replace("COUNTA", "SUM")}`);
      if (range) {
        const count = calculateRangeCountA(range, getCellValue);
        expression = expression.replace(countFormula, count.toString());
      }
    }
  }
  return expression;
}

function handleCOUNTFunction(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const countMatch = expression.match(/COUNT\(([A-Z]+\d+):([A-Z]+\d+)\)/g);
  if (countMatch) {
    for (const countFormula of countMatch) {
      const range = parseSUMRange(`=${countFormula.replace("COUNT", "SUM")}`);
      if (range) {
        const count = calculateRangeCount(range, getCellValue);
        expression = expression.replace(countFormula, count.toString());
      }
    }
  }
  return expression;
}

function handleMAXFunction(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const maxMatch = expression.match(/MAX\(([A-Z]+\d+):([A-Z]+\d+)\)/g);
  if (maxMatch) {
    for (const maxFormula of maxMatch) {
      const range = parseSUMRange(`=${maxFormula.replace("MAX", "SUM")}`);
      if (range) {
        const max = calculateRangeMax(range, getCellValue);
        expression = expression.replace(maxFormula, max.toString());
      }
    }
  }
  return expression;
}

function handleMINFunction(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const minMatch = expression.match(/MIN\(([A-Z]+\d+):([A-Z]+\d+)\)/g);
  if (minMatch) {
    for (const minFormula of minMatch) {
      const range = parseSUMRange(`=${minFormula.replace("MIN", "SUM")}`);
      if (range) {
        const min = calculateRangeMin(range, getCellValue);
        expression = expression.replace(minFormula, min.toString());
      }
    }
  }
  return expression;
}

// Range calculation helpers
function calculateRangeSum(
  range: { start: string; end: string },
  getCellValue: (col: number, row: number) => string | number
): number {
  const startRef = parseCellReference(range.start);
  const endRef = parseCellReference(range.end);

  let sum = 0;
  for (let row = startRef.row; row <= endRef.row; row++) {
    for (let col = startRef.col; col <= endRef.col; col++) {
      const value = getCellValue(col, row);
      const numValue = parseFloat(String(value));
      if (!isNaN(numValue)) {
        sum += numValue;
      }
    }
  }
  return sum;
}

function calculateRangeSumAndCount(
  range: { start: string; end: string },
  getCellValue: (col: number, row: number) => string | number
): { sum: number; count: number } {
  const startRef = parseCellReference(range.start);
  const endRef = parseCellReference(range.end);

  let sum = 0;
  let count = 0;
  for (let row = startRef.row; row <= endRef.row; row++) {
    for (let col = startRef.col; col <= endRef.col; col++) {
      const value = getCellValue(col, row);
      const numValue = parseFloat(String(value));
      if (!isNaN(numValue)) {
        sum += numValue;
        count++;
      }
    }
  }
  return { sum, count };
}

function calculateRangeCountA(
  range: { start: string; end: string },
  getCellValue: (col: number, row: number) => string | number
): number {
  const startRef = parseCellReference(range.start);
  const endRef = parseCellReference(range.end);

  let count = 0;
  for (let row = startRef.row; row <= endRef.row; row++) {
    for (let col = startRef.col; col <= endRef.col; col++) {
      const value = getCellValue(col, row);
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        count++;
      }
    }
  }
  return count;
}

function calculateRangeCount(
  range: { start: string; end: string },
  getCellValue: (col: number, row: number) => string | number
): number {
  const startRef = parseCellReference(range.start);
  const endRef = parseCellReference(range.end);

  let count = 0;
  for (let row = startRef.row; row <= endRef.row; row++) {
    for (let col = startRef.col; col <= endRef.col; col++) {
      const value = getCellValue(col, row);
      const numValue = parseFloat(String(value));
      if (!isNaN(numValue)) {
        count++;
      }
    }
  }
  return count;
}

function calculateRangeMax(
  range: { start: string; end: string },
  getCellValue: (col: number, row: number) => string | number
): number {
  const startRef = parseCellReference(range.start);
  const endRef = parseCellReference(range.end);

  let max = -Infinity;
  for (let row = startRef.row; row <= endRef.row; row++) {
    for (let col = startRef.col; col <= endRef.col; col++) {
      const value = getCellValue(col, row);
      const numValue = parseFloat(String(value));
      if (!isNaN(numValue) && numValue > max) {
        max = numValue;
      }
    }
  }
  return max === -Infinity ? 0 : max;
}

function calculateRangeMin(
  range: { start: string; end: string },
  getCellValue: (col: number, row: number) => string | number
): number {
  const startRef = parseCellReference(range.start);
  const endRef = parseCellReference(range.end);

  let min = Infinity;
  for (let row = startRef.row; row <= endRef.row; row++) {
    for (let col = startRef.col; col <= endRef.col; col++) {
      const value = getCellValue(col, row);
      const numValue = parseFloat(String(value));
      if (!isNaN(numValue) && numValue < min) {
        min = numValue;
      }
    }
  }
  return min === Infinity ? 0 : min;
}

function replaceCellReferences(
  expression: string,
  getCellValue: (col: number, row: number) => string | number
): string {
  const cellRefs = parseFormula(`=${expression}`);
  for (const cellRef of cellRefs) {
    const { col, row } = parseCellReference(cellRef);
    const value = getCellValue(col, row);
    const numValue = parseFloat(String(value));

    // Replace with numeric value or 0 if not a number
    const replacement = isNaN(numValue) ? "0" : numValue.toString();
    expression = expression.replace(
      new RegExp(`\\b${cellRef}\\b`, "g"),
      replacement
    );
  }
  return expression;
}

function evaluateMathExpression(expression: string): number {
  // Safe evaluation using Function constructor with restricted scope
  try {
    // Remove any potentially dangerous characters
    const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");
    return Function(`"use strict"; return (${safeExpression})`)();
  } catch (error) {
    throw new Error(`Invalid mathematical expression: ${expression}`);
  }
}

// Create formula for adding all cells in a column above current cell
export function createSumColumnAbove(col: number, row: number): string {
  if (row === 0) return "";
  return `=SUM(${getCellReference(col, 0)}:${getCellReference(col, row - 1)})`;
}

// Create formula for adding all cells in a row to the left of current cell
export function createSumRowLeft(col: number, row: number): string {
  if (col === 0) return "";
  return `=SUM(${getCellReference(0, row)}:${getCellReference(col - 1, row)})`;
}

// Create formula for multiplying cells in the same row
export function createMultiplyRow(
  startCol: number,
  endCol: number,
  row: number
): string {
  const cells = [];
  for (let col = startCol; col <= endCol; col++) {
    cells.push(getCellReference(col, row));
  }
  return `=${cells.join("*")}`;
}

// Create formula for adding cells in the same row
export function createAddRow(
  startCol: number,
  endCol: number,
  row: number
): string {
  const cells = [];
  for (let col = startCol; col <= endCol; col++) {
    cells.push(getCellReference(col, row));
  }
  return `=${cells.join("+")}`;
}

// Find cells that depend on the given formula
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
