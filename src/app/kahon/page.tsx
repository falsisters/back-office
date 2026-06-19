"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import KahonManagement from "@/components/Kahon/KahonManagement";

export default function KahonPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !user) {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense
        fallback={<div className="p-4">Loading Kahon Management...</div>}
      >
        <KahonManagement />
      </Suspense>
    </div>
  );
}
