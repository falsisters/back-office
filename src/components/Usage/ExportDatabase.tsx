"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";

export const ExportDatabase = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportDatabase = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement database export logic
      console.log("Exporting database...");
      // Add your export logic here
    } catch (error) {
      console.error("Error exporting database:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearing(true);
    try {
      // TODO: Implement database clear logic
      console.log("Clearing database...");
      // Add your clear logic here
    } catch (error) {
      console.error("Error clearing database:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportDatabase}
        disabled={isExporting}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export Database"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4" />
            Clear Database
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              data from your database. All tables, records, and relationships
              will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearDatabase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Yes, clear database"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
