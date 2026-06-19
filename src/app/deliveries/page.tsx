"use client";

import { Suspense } from "react";
import { DeliveryList } from "@/components/Deliveries/DeliveryList";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function DeliveriesPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Spinner />}>
        <DeliveryList />
      </Suspense>
    </div>
  );
}
