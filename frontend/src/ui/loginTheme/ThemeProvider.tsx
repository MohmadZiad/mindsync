"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type DuoTheme = "serene" | "neo";

type Ctx = {
  theme: DuoTheme;
  setTheme: (t: DuoTheme) => void;
  ready: boolean;
};

const Ctx = createContext<Ctx>({
  theme: "serene",
  setTheme: () => {},
  ready: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DuoTheme>("serene");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("login_duo_theme") as DuoTheme) || "serene";
    setThemeState(saved);
    setReady(true);
  }, []);

  const setTheme = (t: DuoTheme) => {
    setThemeState(t);
    localStorage.setItem("login_duo_theme", t);
  };

  return (
    <Ctx.Provider value={{ theme, setTheme, ready }}>
      {/* نضيف data-theme كي يشتغل الـ CSS variables */}
      <div data-theme={theme}>{children}</div>
    </Ctx.Provider>
  );
}

export const useDuoTheme = () => useContext(Ctx);
