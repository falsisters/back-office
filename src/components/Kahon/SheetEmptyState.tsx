// src/components/Kahon/SheetEmptyState.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card";

interface SheetEmptyStateProps {
  message: string;
  mode: 'kahon' | 'inventory';
}

export function SheetEmptyState({ message, mode }: SheetEmptyStateProps) {
  const borderColor = mode === 'kahon' ? 'border-primary' : 'border-orange-500';
  const bgGradient = mode === 'kahon' ? 'from-primary/5' : 'from-orange-50';
  
  return (
    <Card className={`w-full shadow-md bg-gradient-to-b from-white to-gray-50 border-t-4 ${borderColor}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}