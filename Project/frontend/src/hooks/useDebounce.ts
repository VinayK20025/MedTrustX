/**
 * MedTrustX — useDebounce Hook
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/** Debounce a value */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/** Debounce a callback function */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );
}
