"use client";

import { useEffect } from "react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

interface AgGridProviderProps {
  children: React.ReactNode;
}

export default function AgGridProvider({ children }: AgGridProviderProps) {
  useEffect(() => {
    // Register AG-Grid modules on the client side
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);

  return <>{children}</>;
}
