// src/utils/types/inventory.type.ts

export interface InventoryCellOperation {
  value: string;
  id?: string; // For updates
  color?: string | null; // Allow null for removing colors
  rowId?: string; // For new cells
  columnIndex?: number; // For new cells
  formula?: string;
}

export interface InventoryCellOperationBatch {
  cells: InventoryCellOperation[];
}

// ...existing code...