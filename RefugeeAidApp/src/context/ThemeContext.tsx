import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, darkColors, getTheme, Theme } from '../theme';
import { STORAGE_KEYS } from '../utils/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  // theme is the resolved Theme object (colors, spacing, typography, isDark)
  theme: Theme;
  // current selected mode: light | dark | system
  mode: ThemeMode;
  colorScheme: Exclude<ColorSchemeName, null>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const defaultColorScheme: Exclude<ColorSchemeName, null> = (Appearance.getColorScheme() || 'light') as Exclude<ColorSchemeName, null>;

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [colorScheme, setColorScheme] = useState<Exclude<ColorSchemeName, null>>(defaultColorScheme);

  useEffect(() => {
    // Load stored theme preference
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      } catch (e) {
        // ignore
      }
    })();

    // Listen to system changes
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setColorScheme(colorScheme);
      }
    });

    return () => sub.remove();
  }, []);

  // Compute effective color scheme
  const effectiveScheme: Exclude<ColorSchemeName, null> = (mode === 'system' ? (Appearance.getColorScheme() || 'light') : mode) as Exclude<ColorSchemeName, null>;

  useEffect(() => {
    // keep colorScheme state in sync (in case theme changes programmatically)
    setColorScheme(effectiveScheme);
  }, [mode, effectiveScheme]);

  const themeObj: Theme = getTheme(effectiveScheme === 'dark');

  const setTheme = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newMode);
      setModeState(newMode);
    } catch (e) {
      // ignore write errors
    }
  };

  const toggleTheme = async () => {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'light' : (colorScheme === 'dark' ? 'light' : 'dark');
    await setTheme(next as ThemeMode);
  };

  return (
    <ThemeContext.Provider value={{ theme: themeObj, mode, colorScheme: effectiveScheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
