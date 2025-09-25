import { useCallback, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "ms-focus"; // "1" | "0"

export function useFocusMode() {
  const [isFocus, setIsFocus] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  // reflect to <html> immediately on mount and whenever changes
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isFocus) {
      root.setAttribute("data-focus", "true");
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      root.removeAttribute("data-focus");
      localStorage.setItem(STORAGE_KEY, "0");
    }
  }, [isFocus]);

  const enable = useCallback(() => setIsFocus(true), []);
  const disable = useCallback(() => setIsFocus(false), []);
  const toggle = useCallback(() => setIsFocus((v) => !v), []);

  return { isFocus, enable, disable, toggle };
}
