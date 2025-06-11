import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export dependency tracking utilities
export * from "./utils/dependencyTracker";
export * from "./utils/formulaParser";
