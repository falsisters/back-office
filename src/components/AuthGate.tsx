"use client";

import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import type React from "react";

interface AuthGateProps {
  requireAuth: boolean;
  children: React.ReactNode;
}

export function AuthGate({ requireAuth, children }: AuthGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (requireAuth && !user) {
    redirect("/login");
  }

  if (!requireAuth && user) {
    redirect("/");
  }

  return <>{children}</>;
}
