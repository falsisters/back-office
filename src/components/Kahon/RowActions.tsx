// src/components/Kahon/RowActions.tsx
"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useKahon } from "@/context/KahonContext";

export function RowActions({ rowId }: { rowId: string }) {
  const { deleteRow, loadingOperations } = useKahon();

  return (
    <Button 
      variant="destructive" 
      size="icon" 
      onClick={() => deleteRow(rowId)}
      disabled={loadingOperations}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}