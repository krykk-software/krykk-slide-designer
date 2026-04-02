import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorWithAlpha(color: string, alpha: number): string {
  const hslMatch = color.match(/hsl\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\s*\)/);
  if (hslMatch) {
    return `hsla(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%, ${alpha})`;
  }
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

export function generateMonochromaticScale(baseHue: number): Record<string, string> {
  return {
    blue: `hsl(${baseHue}, 85%, 55%)`,
    green: `hsl(${baseHue}, 70%, 42%)`,
    yellow: `hsl(${baseHue}, 60%, 65%)`,
    purple: `hsl(${baseHue}, 50%, 50%)`,
    red: `hsl(${baseHue}, 40%, 35%)`,
    orange: `hsl(${baseHue}, 75%, 60%)`,
    teal: `hsl(${baseHue}, 65%, 38%)`,
    pink: `hsl(${baseHue}, 55%, 70%)`,
  };
}
