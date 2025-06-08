"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useKahon } from "@/context/KahonContext";
import { Input } from "../ui/input";

export function AddCalculationRowButton() {
  const { selectedSheet, addCalculationRow, loadingOperations } = useKahon();
  const [rowIndex, setRowIndex] = useState<number | "">("");

  const handleClick = async () => {
    if (!selectedSheet || rowIndex === "") return;
    
    await addCalculationRow({
      sheetId: selectedSheet,
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
        disabled={loadingOperations || rowIndex === ""}
        variant="secondary"
        size="sm"
      >
        Add Calculation Row
      </Button>
    </div>
  );
}