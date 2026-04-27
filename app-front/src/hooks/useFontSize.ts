"use client";

import { useState, useEffect } from "react";

export type FontSize = "sm" | "base" | "lg";

const SIZES: FontSize[] = ["sm", "base", "lg"];
const STORAGE_KEY = "gc:font-size";

export function useFontSize() {
  const [size, setSize] = useState<FontSize>("sm");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as FontSize;
    if (saved && SIZES.includes(saved)) setSize(saved);
  }, []);

  const cycle = () => {
    setSize((prev) => {
      const next = SIZES[(SIZES.indexOf(prev) + 1) % SIZES.length];
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return { fontSize: size, cycleFontSize: cycle };
}
