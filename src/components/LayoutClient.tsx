"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import AgGridProvider from "@/components/providers/AgGridProvider";
import { Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <AgGridProvider>
      {user ? (
        <div className="min-h-screen flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto md:p-8 p-4">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-64">
                    <Spinner />
                  </div>
                }
              >
                {children}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      ) : (
        <div className="min-h-screen">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-screen">
                  <Spinner />
                </div>
              }
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
      <Toaster richColors closeButton />
    </AgGridProvider>
  );
}
