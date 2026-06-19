import SalesList from "@/components/Sales/SalesList";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AuthGate } from "@/components/AuthGate";

export default function SalesPage() {
  return (
    <AuthGate requireAuth>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Spinner />}>
          <SalesList />
        </Suspense>
      </div>
    </AuthGate>
  );
}
