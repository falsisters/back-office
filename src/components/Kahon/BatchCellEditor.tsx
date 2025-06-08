"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useKahon } from "@/context/KahonContext";

export function BatchCellEditor() {
  const { updateCells, loadingOperations } = useKahon();
  const [open, setOpen] = useState(false);
  const [cellData, setCellData] = useState("");

  const handleSubmit = async () => {
    try {
      // Parse cell data (format: cellId,value,formula?;)
      const cells = cellData.split(';').map(line => {
        const [id, value, formula] = line.split(',');
        return { id, value, formula };
      }).filter(cell => cell.id && cell.value);
      
      if (cells.length > 0) {
        await updateCells({ cells });
        setOpen(false);
        setCellData("");
      }
    } catch (error) {
      console.error("Invalid cell data format", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Batch Edit Cells
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batch Cell Editor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cell Data (format: id,value,formula?;)</Label>
            <Textarea
              value={cellData}
              onChange={(e) => setCellData(e.target.value)}
              rows={8}
              placeholder="cell-id-1,New Value,=SUM(A1);cell-id-2,Another Value;"
            />
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={loadingOperations || !cellData.trim()}
            className="w-full"
          >
            {loadingOperations ? "Updating..." : "Update Cells"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}