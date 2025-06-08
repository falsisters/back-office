// src/components/Kahon/AddItemRowModal.tsx
"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useKahon } from "@/context/KahonContext";

export function AddItemRowModal() {
  const { selectedSheet, addItemRow, loadingOperations } = useKahon();
  const [kahonItemId, setKahonItemId] = useState("");
  const [rowIndex, setRowIndex] = useState<number | "">("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheet || !kahonItemId || rowIndex === "") return;
    
    await addItemRow({
      sheetId: selectedSheet,
      kahonItemId,
      rowIndex: Number(rowIndex)
    });
    
    setOpen(false);
    setKahonItemId("");
    setRowIndex("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Add Item Row
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Item Row</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="itemId">Item ID</Label>
            <Input
              id="itemId"
              value={kahonItemId}
              onChange={(e) => setKahonItemId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="rowIndex">Row Index</Label>
            <Input
              id="rowIndex"
              type="number"
              value={rowIndex}
              onChange={(e) => setRowIndex(Number(e.target.value) || "")}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={loadingOperations}
            className="w-full"
          >
            {loadingOperations ? "Adding..." : "Add Row"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}