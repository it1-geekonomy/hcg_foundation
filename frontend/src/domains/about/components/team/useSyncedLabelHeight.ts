"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSyncedLabelHeight(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState<number | null>(null);

  const measure = useCallback(() => {
    const heights = refs.current.map((el) => el?.offsetHeight ?? 0);
    const max = heights.length ? Math.max(...heights) : 0;
    setHeight(max || null);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, count]);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    refs.current[i] = el;
  };

  return { setRef, height };
}
