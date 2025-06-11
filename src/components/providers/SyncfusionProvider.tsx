"use client";

import { useEffect } from "react";
import { registerLicense } from "@syncfusion/ej2-base";

interface SyncfusionProviderProps {
  children: React.ReactNode;
}

export default function SyncfusionProvider({
  children,
}: SyncfusionProviderProps) {
  useEffect(() => {
    // Register the license key when component mounts
    registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY || "");
  }, []);

  return <>{children}</>;
}
