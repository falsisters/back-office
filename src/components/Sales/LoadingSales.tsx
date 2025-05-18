// components/LoadingSales.tsx
"use client";

import { Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function LoadingSales() {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading sales data...</p>
      </CardContent>
    </Card>
  );
}