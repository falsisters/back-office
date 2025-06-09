"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useKahon } from "@/context/KahonContext";
import { useInventory } from "@/context/InventoryContext";
import { Input } from "../ui/input";

interface AddCalculationRowButtonProps {
  mode: 'kahon' | 'inventory';
}

export function AddCalculationRowButton({ mode }: AddCalculationRowButtonProps) {
  const kahonContext = useKahon();
  const inventoryContext = useInventory();
  const [rowIndex, setRowIndex] = useState<number | "">("");

  const context = mode === 'kahon' ? kahonContext : inventoryContext;

  const handleClick = async () => {
    if (!context.selectedSheet || rowIndex === "") return;
    
    await context.addCalculationRow({
      sheetId: context.selectedSheet,
      rowIndex: Number(rowIndex)
    });
    
    setRowIndex("");
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder="Row index"
        value={rowIndex}
        onChange={(e) => setRowIndex(Number(e.target.value) || "")}
        className="w-24"
      />
      <Button 
        onClick={handleClick}
        disabled={context.loadingOperations || rowIndex === ""}
        variant="secondary"
        size="sm"
      >
        Add Calculation Row
      </Button>
    </div>
  );
}