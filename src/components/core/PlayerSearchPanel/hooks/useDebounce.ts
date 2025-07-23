import { useState, useEffect, useCallback } from "react";

/**
 * Optimized debounce hook for better search performance
 * Prevents unnecessary re-renders and provides immediate feedback
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const updateDebouncedValue = useCallback(() => {
    setDebouncedValue(value);
  }, [value]);

  useEffect(() => {
    // If the value is empty (user cleared search), update immediately
    if (typeof value === "string" && value.trim() === "") {
      setDebouncedValue(value);
      return;
    }

    const handler = setTimeout(updateDebouncedValue, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, updateDebouncedValue]);

  return debouncedValue;
}
