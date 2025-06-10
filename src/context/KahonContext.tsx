// src/context/KahonContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { addItemRow } from "@/lib/server/addItemRow";
import { addCalculationRow } from "@/lib/server/addCalculationRow";
import { addCells } from "@/lib/server/addCells";
import { updateKahonCells } from "@/lib/server/updateKahonCells";
import { deleteRow } from "@/lib/server/deleteRow";
import { deleteCell } from "@/lib/server/deleteCell";
import type {
  ItemRowOperation,
  RowOperation,
  CellOperationBatch,
} from "../../utils/types/kahon.type";

interface KahonContextType {
  selectedSheet: string | null;
  setSelectedSheet: (id: string) => void;
  addItemRow: (payload: ItemRowOperation) => Promise<void>;
  addCalculationRow: (payload: RowOperation) => Promise<void>;
  addCells: (payload: CellOperationBatch) => Promise<void>;
  updateCells: (payload: CellOperationBatch) => Promise<void>;
  deleteRow: (rowId: string) => Promise<void>;
  deleteCell: (cellId: string) => Promise<void>;
  loadingOperations: boolean;
}

const KahonContext = createContext<KahonContextType | undefined>(undefined);

export function KahonProvider({ children }: { children: React.ReactNode }) {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [loadingOperations, setLoadingOperations] = useState(false);

  const handleAddItemRow = useCallback(async (payload: ItemRowOperation) => {
    setLoadingOperations(true);
    try {
      await addItemRow(payload);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleAddCalculationRow = useCallback(async (payload: RowOperation) => {
    setLoadingOperations(true);
    try {
      await addCalculationRow(payload);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleAddCells = useCallback(async (payload: CellOperationBatch) => {
    setLoadingOperations(true);
    try {
      // Filter out or throw error if any cell is missing required fields
      const validCells = payload.cells.filter(
        (cell) =>
          typeof cell.rowId === "string" && typeof cell.columnIndex === "number"
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

      await addCells({ cells: validCells });
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleUpdateCells = useCallback(async (payload: CellOperationBatch) => {
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

      await updateKahonCells({ cells: cellsWithValues });
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleDeleteRow = useCallback(async (rowId: string) => {
    setLoadingOperations(true);
    try {
      await deleteRow(rowId);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const handleDeleteCell = useCallback(async (cellId: string) => {
    setLoadingOperations(true);
    try {
      await deleteCell(cellId);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  return (
    <KahonContext.Provider
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
    </KahonContext.Provider>
  );
}

export function useKahon() {
  const context = useContext(KahonContext);
  if (!context) {
    throw new Error("useKahon must be used within a KahonProvider");
  }
  return context;
}
