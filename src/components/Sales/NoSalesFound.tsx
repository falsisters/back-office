// components/NoSalesFound.tsx
"use client";

import { ShoppingBag } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function NoSalesFound() {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center flex flex-col items-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            No sales found matching your filters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}