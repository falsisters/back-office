// src/components/LoadingScreen.tsx
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="ml-4 text-xl font-medium text-primary">Loading Kahon...</span>
    </div>
  );
}