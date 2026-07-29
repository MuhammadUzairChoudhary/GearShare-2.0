import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { themeColors } from './colors';
import type { ThemeColorScheme } from './colors';

type ColorMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ColorMode;
  colors: Record<string, string>;
  isDark: boolean;
  toggleMode: () => void;
  setMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ColorMode;
}

export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ColorMode>(
    initialMode ?? (systemColorScheme as ColorMode) ?? 'dark',
  );

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: themeColors[mode],
      isDark: mode === 'dark',
      toggleMode,
      setMode,
    }),
    [mode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
