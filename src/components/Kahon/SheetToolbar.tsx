// src/components/Kahon/SheetToolbar.tsx
"use client"

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface SheetToolbarProps {
  dateRange?: DateRange;
  loading: boolean;
  onRefresh: () => void;
  onSave: () => void;
}

export function SheetToolbar({ dateRange, loading, onRefresh, onSave }: SheetToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">Kahon Sheets</h3>
        <p className="text-sm text-muted-foreground">
          {dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
            : "Select date range to view data"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onRefresh}
          disabled={loading || !dateRange?.from || !dateRange?.to}
          variant="outline"
          size="sm"
          className="border-primary/30 text-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}