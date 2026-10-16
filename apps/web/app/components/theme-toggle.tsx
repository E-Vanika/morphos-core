"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("monika-theme") as Theme | null;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const selected: Theme = stored === "dark" || stored === "light" ? stored : media.matches ? "dark" : "light";
    setTheme(selected);
    applyTheme(selected);

    const followSystem = (event: MediaQueryListEvent) => {
      if (localStorage.getItem("monika-theme")) return;
      const next = event.matches ? "dark" : "light";
      setTheme(next);
      applyTheme(next);
    };
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("monika-theme", next);
    setTheme(next);
    applyTheme(next);
  }

  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
    <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    <span className="theme-label">{theme === "dark" ? "Light" : "Dark"}</span>
  </button>;
}
