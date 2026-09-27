import { useEffect } from "react";
import { useDars } from "@/lib/dars-context";
import { useThemeContext } from "@/lib/theme-provider";

export function ThemePreferenceSync() {
  const { preferences, isHydrated } = useDars();
  const { setThemeMode } = useThemeContext();
  const mode = preferences.themeMode ?? "system";
  useEffect(() => {
    if (isHydrated) setThemeMode(mode);
  }, [isHydrated, mode, setThemeMode]);
  return null;
}
