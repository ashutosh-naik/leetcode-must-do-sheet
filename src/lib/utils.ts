import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSafePath(path: string): boolean {
  try {
    const url = new URL(path, "http://localhost");
    if (url.host !== "localhost") return false;
    const sanitized = url.pathname + url.search + url.hash;
    return (
      sanitized.startsWith("/") &&
      !sanitized.startsWith("//") &&
      !sanitized.startsWith("\\")
    );
  } catch {
    return false;
  }
}
