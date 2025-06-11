/**
 * Converts A1-style cell reference to column/row indices
 * @param cellRef A1, B2, etc.
 * @returns [columnIndex, rowIndex] (0-based)
 */
export function convertA1ToIndices(cellRef: string): [number, number] {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);

  const [, colStr, rowStr] = match;

  // Convert column letters to index (A=0, B=1, etc.)
  let colIndex = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  colIndex -= 1; // Convert to 0-based

  const rowIndex = parseInt(rowStr) - 1; // Convert to 0-based

  return [colIndex, rowIndex];
}

/**
 * Converts column/row indices to A1-style reference
 * @param colIndex 0-based column index
 * @param rowIndex 0-based row index
 * @returns A1-style reference
 */
export function convertIndicesToA1(colIndex: number, rowIndex: number): string {
  let colStr = "";
  let col = colIndex + 1; // Convert to 1-based

  while (col > 0) {
    col -= 1;
    colStr = String.fromCharCode(65 + (col % 26)) + colStr;
    col = Math.floor(col / 26);
  }

  return `${colStr}${rowIndex + 1}`;
}

/**
 * Extracts cell references from a formula
 * @param formula Formula string (e.g., "=A1+B2")
 * @returns Array of cell references found in the formula
 */
export function extractCellReferences(formula: string): string[] {
  const cellRefRegex = /\b[A-Z]+\d+\b/g;
  return formula.match(cellRefRegex) || [];
}

/**
 * Parses a formula with custom named references (Quantity1, Name1, A1, etc.)
 * @param formula Formula string
 * @param customNames Map of custom names to cell references
 * @returns Parsed formula with cell references
 */
export function parseFormula(
  formula: string,
  customNames: Record<string, string> = {}
): string {
  let parsedFormula = formula;

  // Default custom names for Kahon sheets - Quantity is column 0, Name is column 1, then A,B,C...
  const defaultNames = {
    Quantity: "Quantity", // Keep as Quantity for mobile app compatibility
    Name: "Name", // Keep as Name for mobile app compatibility
  };

  const allNames = { ...defaultNames, ...customNames };

  // Replace custom named references (e.g., Quantity1 -> Quantity1, Name1 -> Name1)
  // For A,B,C... columns, they stay as A1, B1, C1...
  for (const [name, replacement] of Object.entries(allNames)) {
    const nameRegex = new RegExp(`\\b${name}(\\d+)\\b`, "g");
    parsedFormula = parsedFormula.replace(nameRegex, `${replacement}$1`);
  }

  return parsedFormula;
}

/**
 * Converts column index to column name for Kahon system
 * 0 = Quantity, 1 = Name, 2 = A, 3 = B, etc.
 */
export function getColumnName(columnIndex: number): string {
  if (columnIndex === 0) return "Quantity";
  if (columnIndex === 1) return "Name";
  return String.fromCharCode(65 + columnIndex - 2); // A, B, C...
}

/**
 * Converts column name to index for Kahon system
 */
export function getColumnIndex(columnName: string): number {
  if (columnName === "Quantity") return 0;
  if (columnName === "Name") return 1;
  return columnName.charCodeAt(0) - 65 + 2; // A=2, B=3, C=4...
}

/**
 * Validates if a formula is safe to execute
 * @param formula Formula string
 * @returns true if formula is safe
 */
export function validateFormula(formula: string): boolean {
  // Remove quotes and strings first
  const cleanFormula = formula.replace(/"[^"]*"/g, "");

  // Check for dangerous functions/operations
  const dangerousPatterns = [
    /\beval\b/i,
    /\bFunction\b/i,
    /\bsetTimeout\b/i,
    /\bsetInterval\b/i,
    /\bdocument\b/i,
    /\bwindow\b/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(cleanFormula));
}

/**
 * Parses and evaluates a formula with cell data
 * @param formula Formula string
 * @param sheetData Sheet data containing all cells
 * @param currentRow Current row index
 * @param currentCol Current column index
 * @returns Evaluated result or error
 */
export function parseAndEvaluateFormula(
  formula: string,
  sheetData: any,
  currentRow: number,
  currentCol: number
): string {
  if (!formula || !formula.startsWith("=")) {
    return formula;
  }

  try {
    // Remove the = sign
    let expression = formula.substring(1);

    // Build cell values map
    const cellValues: Record<string, number> = {};

    if (sheetData?.Rows) {
      sheetData.Rows.forEach((row: any) => {
        row.Cells?.forEach((cell: any) => {
          const columnName = getColumnName(cell.columnIndex);
          const cellRef = `${columnName}${row.rowIndex}`;
          const value = parseFloat(cell.value) || 0;
          cellValues[cellRef] = value;
        });
      });
    }

    // Handle SUM function - convert to simple addition format
    expression = expression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
      if (range.includes(":")) {
        // Range like A1:A5 -> A1 + A2 + A3 + A4 + A5
        const [start, end] = range.split(":");
        const startMatch = start.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Za-z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2]);
          const endRow = parseInt(endMatch[2]);
          const column = startMatch[1];

          const cells = [];
          for (let i = startRow; i <= endRow; i++) {
            cells.push(`${column}${i}`);
          }
          return cells.join(" + ");
        }
      } else {
        // Individual cells like A1,B1,C1 -> A1 + B1 + C1
        const cells = range.split(",").map((c: string) => c.trim());
        return cells.join(" + ");
      }
      return "0";
    });

    // Handle PRODUCT function - convert to simple multiplication format
    expression = expression.replace(/PRODUCT\(([^)]+)\)/g, (match, range) => {
      if (range.includes(":")) {
        // Range like A1:A5 -> A1 * A2 * A3 * A4 * A5
        const [start, end] = range.split(":");
        const startMatch = start.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Za-z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2]);
          const endRow = parseInt(endMatch[2]);
          const column = startMatch[1];

          const cells = [];
          for (let i = startRow; i <= endRow; i++) {
            cells.push(`${column}${i}`);
          }
          return cells.join(" * ");
        }
      } else {
        // Individual cells like A1,B1,C1 -> A1 * B1 * C1
        const cells = range.split(",").map((c: string) => c.trim());
        return cells.join(" * ");
      }
      return "1";
    });

    // Handle SUBTRACT function - convert to simple subtraction format
    expression = expression.replace(/SUBTRACT\(([^)]+)\)/g, (match, range) => {
      if (range.includes(":")) {
        // Range like A1:A5 -> A1 - A2 - A3 - A4 - A5
        const [start, end] = range.split(":");
        const startMatch = start.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Za-z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2]);
          const endRow = parseInt(endMatch[2]);
          const column = startMatch[1];

          const cells = [];
          for (let i = startRow; i <= endRow; i++) {
            cells.push(`${column}${i}`);
          }
          return cells.join(" - ");
        }
      } else {
        // Individual cells like A1,B1,C1 -> A1 - B1 - C1
        const cells = range.split(",").map((c: string) => c.trim());
        return cells.join(" - ");
      }
      return "0";
    });

    // Replace individual cell references
    const cellRefRegex = /\b([A-Za-z]+\d+)\b/g;
    expression = expression.replace(cellRefRegex, (match) => {
      const value = cellValues[match] || 0;
      return value.toString();
    });

    // Evaluate the mathematical expression
    // eslint-disable-next-line no-eval
    const result = eval(expression);

    if (isNaN(result) || !isFinite(result)) {
      return "#ERROR";
    }

    return Number(result).toString();
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR";
  }
}

/**
 * Parses and evaluates a formula with cell data for inventory sheets (A-O columns only)
 * @param formula Formula string
 * @param sheetData Sheet data containing all cells
 * @param currentRow Current row index
 * @param currentCol Current column index
 * @returns Evaluated result or error
 */
export function parseAndEvaluateInventoryFormula(
  formula: string,
  sheetData: any,
  currentRow: number,
  currentCol: number
): string {
  if (!formula || !formula.startsWith("=")) {
    return formula;
  }

  try {
    // Remove the = sign
    let expression = formula.substring(1);

    // Build cell values map for inventory sheets (A-O columns)
    const cellValues: Record<string, number> = {};

    if (sheetData?.Rows) {
      sheetData.Rows.forEach((row: any) => {
        row.Cells?.forEach((cell: any) => {
          // For inventory sheets, columnIndex 0 = A, 1 = B, etc.
          const columnName = String.fromCharCode(65 + cell.columnIndex);
          const cellRef = `${columnName}${row.rowIndex}`;
          const value = parseFloat(cell.value) || 0;
          cellValues[cellRef] = value;
        });
      });
    }

    // Handle SUM function - convert to simple addition format
    expression = expression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
      if (range.includes(":")) {
        // Range like A1:A5 -> A1 + A2 + A3 + A4 + A5
        const [start, end] = range.split(":");
        const startMatch = start.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Za-z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2]);
          const endRow = parseInt(endMatch[2]);
          const column = startMatch[1];

          const cells = [];
          for (let i = startRow; i <= endRow; i++) {
            cells.push(`${column}${i}`);
          }
          return cells.join(" + ");
        }
      } else {
        // Individual cells like A1,B1,C1 -> A1 + B1 + C1
        const cells = range.split(",").map((c: string) => c.trim());
        return cells.join(" + ");
      }
      return "0";
    });

    // Handle PRODUCT function - convert to simple multiplication format
    expression = expression.replace(/PRODUCT\(([^)]+)\)/g, (match, range) => {
      if (range.includes(":")) {
        // Range like A1:A5 -> A1 * A2 * A3 * A4 * A5
        const [start, end] = range.split(":");
        const startMatch = start.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Za-z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2]);
          const endRow = parseInt(endMatch[2]);
          const column = startMatch[1];

          const cells = [];
          for (let i = startRow; i <= endRow; i++) {
            cells.push(`${column}${i}`);
          }
          return cells.join(" * ");
        }
      } else {
        // Individual cells like A1,B1,C1 -> A1 * B1 * C1
        const cells = range.split(",").map((c: string) => c.trim());
        return cells.join(" * ");
      }
      return "1";
    });

    // Handle SUBTRACT function - convert to simple subtraction format
    expression = expression.replace(/SUBTRACT\(([^)]+)\)/g, (match, range) => {
      if (range.includes(":")) {
        // Range like A1:A5 -> A1 - A2 - A3 - A4 - A5
        const [start, end] = range.split(":");
        const startMatch = start.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Za-z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2]);
          const endRow = parseInt(endMatch[2]);
          const column = startMatch[1];

          const cells = [];
          for (let i = startRow; i <= endRow; i++) {
            cells.push(`${column}${i}`);
          }
          return cells.join(" - ");
        }
      } else {
        // Individual cells like A1,B1,C1 -> A1 - B1 - C1
        const cells = range.split(",").map((c: string) => c.trim());
        return cells.join(" - ");
      }
      return "0";
    });

    // Replace individual cell references
    const cellRefRegex = /\b([A-Za-z]+\d+)\b/g;
    expression = expression.replace(cellRefRegex, (match) => {
      const value = cellValues[match] || 0;
      return value.toString();
    });

    // Evaluate the mathematical expression
    // eslint-disable-next-line no-eval
    const result = eval(expression);

    if (isNaN(result) || !isFinite(result)) {
      return "#ERROR";
    }

    return Number(result).toString();
  } catch (error) {
    console.error("Inventory formula evaluation error:", error);
    return "#ERROR";
  }
}

/**
 * Evaluates a simple mathematical formula
 * @param formula Mathematical formula string
 * @param cellValues Map of cell references to their values
 * @returns Calculated result
 */
export function evaluateFormula(
  formula: string,
  cellValues: Record<string, number> = {}
): number {
  if (!formula.startsWith("=")) {
    return parseFloat(formula) || 0;
  }

  let expression = formula.substring(1); // Remove the = sign

  // Replace cell references with their values
  for (const [cellRef, value] of Object.entries(cellValues)) {
    const regex = new RegExp(`\\b${cellRef}\\b`, "g");
    expression = expression.replace(regex, value.toString());
  }

  // Handle SUM function - convert to simple addition
  expression = expression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
    if (range.includes(":")) {
      // Range like A1:A5
      const [start, end] = range.split(":");
      const values = Object.entries(cellValues)
        .filter(([ref]) => ref >= start && ref <= end)
        .map(([, val]) => val);
      return values.join(" + ");
    } else {
      // Individual cells like A1,B1,C1
      const cells = range.split(",").map((c: string) => c.trim());
      return cells.map((cell: any) => cellValues[cell] || 0).join(" + ");
    }
  });

  // Handle PRODUCT function - convert to simple multiplication
  expression = expression.replace(/PRODUCT\(([^)]+)\)/g, (match, range) => {
    if (range.includes(":")) {
      const [start, end] = range.split(":");
      const values = Object.entries(cellValues)
        .filter(([ref]) => ref >= start && ref <= end)
        .map(([, val]) => val || 1);
      return values.join(" * ");
    } else {
      const cells = range.split(",").map((c: string) => c.trim());
      return cells.map((cell: any) => cellValues[cell] || 1).join(" * ");
    }
  });

  // Handle SUBTRACT function - convert to simple subtraction
  expression = expression.replace(/SUBTRACT\(([^)]+)\)/g, (match, range) => {
    if (range.includes(":")) {
      const [start, end] = range.split(":");
      const values = Object.entries(cellValues)
        .filter(([ref]) => ref >= start && ref <= end)
        .map(([, val]) => val);
      return values.join(" - ");
    } else {
      const cells = range.split(",").map((c: string) => c.trim());
      return cells.map((cell: any) => cellValues[cell] || 0).join(" - ");
    }
  });

  try {
    // Simple evaluation - in production, use a proper formula evaluator
    // eslint-disable-next-line no-eval
    return eval(expression) || 0;
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return 0;
  }
}

/**
 * Validates if a formula syntax is correct
 * @param formula Formula string
 * @returns true if valid, false otherwise
 */
export function isValidFormula(formula: string): boolean {
  if (!formula.startsWith("=")) return true; // Not a formula

  try {
    // Basic syntax validation
    const expression = formula.substring(1);

    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (const char of expression) {
      if (char === "(") parenthesesCount++;
      if (char === ")") parenthesesCount--;
      if (parenthesesCount < 0) return false;
    }

    if (parenthesesCount !== 0) return false;

    // Check for valid characters (letters, numbers, operators, parentheses, commas, colons)
    const validChars = /^[A-Za-z0-9+\-*/().,:= ]+$/;
    if (!validChars.test(expression)) return false;

    // Check for valid function names - now also including SUBTRACT
    const functions = ["SUM", "PRODUCT", "SUBTRACT", "ABS", "MIN", "MAX"];
    const functionRegex = /([A-Z]+)\(/g;
    let match;
    while ((match = functionRegex.exec(expression)) !== null) {
      if (!functions.includes(match[1])) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Gets display value for a cell (either calculated formula result or raw value)
 * @param cell Cell data
 * @param sheetData Complete sheet data for formula evaluation
 * @param rowIndex Row index
 * @param columnIndex Column index
 * @param sheetType Type of sheet ('kahon' or 'inventory')
 * @returns Display value
 */
export function getCellDisplayValue(
  cell: any,
  sheetData: any,
  rowIndex: number,
  columnIndex: number,
  sheetType: "kahon" | "inventory" = "kahon"
): string {
  if (cell?.formula && cell.formula.startsWith("=")) {
    // Evaluate formula based on sheet type
    if (sheetType === "inventory") {
      const result = parseAndEvaluateInventoryFormula(
        cell.formula,
        sheetData,
        rowIndex,
        columnIndex
      );
      return result;
    } else {
      const result = parseAndEvaluateFormula(
        cell.formula,
        sheetData,
        rowIndex,
        columnIndex
      );
      return result;
    }
  }

  return cell?.value || "";
}

/**
 * Enhanced cell display value with dependency resolution
 */
export function getCellDisplayValueWithDependencies(
  cell: any,
  sheetData: any,
  rowIndex: number,
  columnIndex: number,
  sheetType: "kahon" | "inventory" = "kahon"
): string {
  if (cell?.formula && cell.formula.startsWith("=")) {
    // Evaluate formula with current sheet data state
    if (sheetType === "inventory") {
      const result = parseAndEvaluateInventoryFormula(
        cell.formula,
        sheetData,
        rowIndex,
        columnIndex
      );
      return result;
    } else {
      const result = parseAndEvaluateFormula(
        cell.formula,
        sheetData,
        rowIndex,
        columnIndex
      );
      return result;
    }
  }

  return cell?.value || "";
}

/**
 * Checks if a formula references a specific cell
 */
export function formulaReferencesCell(
  formula: string,
  targetCellRef: string
): boolean {
  if (!formula || !formula.startsWith("=")) return false;

  const references = extractCellReferences(formula);
  return references.includes(targetCellRef);
}

/**
 * Updates cell values in sheet data (for dependency calculations)
 */
export function updateCellValueInSheetData(
  sheetData: any,
  rowIndex: number,
  columnIndex: number,
  newValue: string
): any {
  const updatedData = JSON.parse(JSON.stringify(sheetData)); // Deep clone

  const row = updatedData.Rows?.find((r: any) => r.rowIndex === rowIndex);
  if (row) {
    const cell = row.Cells?.find((c: any) => c.columnIndex === columnIndex);
    if (cell) {
      cell.value = newValue;
    }
  }

  return updatedData;
}
