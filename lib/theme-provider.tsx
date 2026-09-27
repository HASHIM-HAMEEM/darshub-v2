import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import { SchemeColors, type ColorScheme } from "@/constants/theme";

export type ThemeMode = ColorScheme | "system";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const colorScheme: ColorScheme = themeMode === "system" ? systemScheme : themeMode;

  const applyScheme = useCallback((scheme: ColorScheme, mode: ThemeMode) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(mode === "system" ? null : scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      Object.entries(SchemeColors[scheme]).forEach(([token, value]) => root.style.setProperty(`--color-${token}`, value));
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => setThemeMode(scheme), []);

  useLayoutEffect(() => applyScheme(colorScheme, themeMode), [applyScheme, colorScheme, themeMode]);

  const themeVariables = useMemo(() => vars({
    "color-primary": SchemeColors[colorScheme].primary,
    "color-on-primary": SchemeColors[colorScheme].onPrimary,
    "color-background": SchemeColors[colorScheme].background,
    "color-surface": SchemeColors[colorScheme].surface,
    "color-wash": (SchemeColors[colorScheme] as typeof SchemeColors[ColorScheme] & { wash: string }).wash,
    "color-foreground": SchemeColors[colorScheme].foreground,
    "color-muted": SchemeColors[colorScheme].muted,
    "color-border": SchemeColors[colorScheme].border,
    "color-success": SchemeColors[colorScheme].success,
    "color-warning": SchemeColors[colorScheme].warning,
    "color-error": SchemeColors[colorScheme].error,
  }), [colorScheme]);

  const value = useMemo(
    () => ({ colorScheme, themeMode, setColorScheme, setThemeMode }),
    [colorScheme, themeMode, setColorScheme],
  );

  return <ThemeContext.Provider value={value}><View style={[{ flex: 1 }, themeVariables]}>{children}</View></ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used within ThemeProvider");
  return context;
}
