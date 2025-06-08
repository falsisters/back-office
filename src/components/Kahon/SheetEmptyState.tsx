// src/components/Kahon/SheetEmptyState.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card";

interface SheetEmptyStateProps {
  message: string;
}

export function SheetEmptyState({ message }: SheetEmptyStateProps) {
  return (
    <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}