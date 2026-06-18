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
import { Trash2, Download } from "lucide-react";
import { useState } from "react";
import { exportStorage, clearStorage } from "@/lib/server/Storage";

export const ClearStorage = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportStorage = async () => {
    setIsExporting(true);
    try {
      const base64 = await exportStorage();
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: "application/zip" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storage-export-${
        new Date().toISOString().split("T")[0]
      }.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting storage:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearStorage = async () => {
    setIsClearing(true);
    try {
      const result = await clearStorage();
      if (result.success) {
        console.log("Storage cleared successfully");
        // You might want to refresh the page or update the UI here
        window.location.reload();
      } else {
        console.error("Failed to clear storage:", result.error);
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleExportStorage}
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export Storage"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4" />
            Clear Storage
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              files and media from your storage bucket. All uploaded images,
              documents, and other files will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearStorage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Yes, clear storage"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
