import { lg } from "@/utils/noProd";
import { useCallback, useRef, useEffect } from "react";

export function useDebounceFunction<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up function to clear the timeout
  const cleanUp = useCallback(() => {
    lg("cleanup debounce");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Use useEffect to clean up on unmount
  useEffect(() => {
    return cleanUp;
  }, [cleanUp]);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      cleanUp();

      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay, cleanUp]
  );

  return debouncedFunction as T;
}
