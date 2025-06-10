"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { addInventoryItemRow } from "@/lib/server/addInventoryItemRow";
import { addInventoryCalculationRow } from "@/lib/server/addInventoryCalculationRow";
import { addInventoryCells } from "@/lib/server/addInventoryCells";
import { updateInventoryCells } from "@/lib/server/updateInventoryCells";
import { deleteInventoryRow } from "@/lib/server/deleteInventoryRow";
import { deleteInventoryCell } from "@/lib/server/deleteInventoryCell";
import type {
  AddItemRowParams,
  AddCalculationRowParams,
  InventoryCellOperationBatch,
} from "../../utils/types/inventory.type";

interface InventoryContextType {
  selectedSheet: string | null;
  setSelectedSheet: (id: string) => void;
  addItemRow: (payload: AddItemRowParams) => Promise<void>;
  addCalculationRow: (payload: AddCalculationRowParams) => Promise<void>;
  addCells: (payload: InventoryCellOperationBatch) => Promise<void>;
  updateCells: (payload: InventoryCellOperationBatch) => Promise<void>;
  deleteRow: (rowId: string) => Promise<void>;
  deleteCell: (cellId: string) => Promise<void>;
  loadingOperations: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [loadingOperations, setLoadingOperations] = useState(false);

  const handleAddItemRow = useCallback(async (payload: AddItemRowParams) => {
    setLoadingOperations(true);
    try {
      await addInventoryItemRow(payload);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleAddCalculationRow = useCallback(
    async (payload: AddCalculationRowParams) => {
      setLoadingOperations(true);
      try {
        await addInventoryCalculationRow(payload);
      } finally {
        setLoadingOperations(false);
      }
    },
    []
  );

  const handleAddCells = useCallback(
    async (payload: InventoryCellOperationBatch) => {
      setLoadingOperations(true);
      try {
        // Filter out or throw error if any cell is missing required fields
        const validCells = payload.cells.filter(
          (cell) =>
            typeof cell.rowId === "string" &&
            typeof cell.columnIndex === "number"
        ) as {
          value: string;
          rowId: string;
          columnIndex: number;
          color?: string;
          formula?: string;
        }[];

        if (validCells.length !== payload.cells.length) {
          throw new Error(
            "All cells must have rowId (string) and columnIndex (number)."
          );
        }

        await addInventoryCells({ cells: validCells });
      } finally {
        setLoadingOperations(false);
      }
    },
    []
  );

  const handleUpdateCells = useCallback(
    async (payload: InventoryCellOperationBatch) => {
      setLoadingOperations(true);
      try {
        // Filter out or throw error if any cell is missing required id
        const validCells = payload.cells.filter(
          (cell) => typeof cell.id === "string"
        ) as {
          value?: string;
          id: string;
          color?: string | null | undefined; // Allow null and undefined
          formula?: string;
        }[];

        if (validCells.length !== payload.cells.length) {
          throw new Error("All cells must have an id (string).");
        }

        // For cells that only have color updates, we need to preserve existing values
        // The frontend should handle this by providing the current value
        const cellsWithValues = validCells.map((cell) => ({
          ...cell,
          value: cell.value || "", // Ensure value is always present
          // Convert null to undefined for color to match expected type
          color: cell.color === null ? undefined : cell.color,
        }));

        await updateInventoryCells({ cells: cellsWithValues });
      } finally {
        setLoadingOperations(false);
      }
    },
    []
  );

  const handleDeleteRow = useCallback(async (rowId: string) => {
    setLoadingOperations(true);
    try {
      await deleteInventoryRow(rowId);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleDeleteCell = useCallback(async (cellId: string) => {
    setLoadingOperations(true);
    try {
      await deleteInventoryCell(cellId);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        selectedSheet,
        setSelectedSheet,
        addItemRow: handleAddItemRow,
        addCalculationRow: handleAddCalculationRow,
        addCells: handleAddCells,
        updateCells: handleUpdateCells,
        deleteRow: handleDeleteRow,
        deleteCell: handleDeleteCell,
        loadingOperations,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
