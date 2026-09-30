import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type Mode = 'system' | 'dark' | 'light';
type Ctx = { mode: Mode; light: boolean; setMode: (m: Mode) => void };

const KEY = 'nvxo-cex.appearance';
const ThemeCtx = createContext<Ctx>({ mode: 'system', light: false, setMode: () => {} });

export const BG = { dark: '#000000', light: '#FFFFFF' };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const sys = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v === 'dark' || v === 'light' || v === 'system') setModeState(v); })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const light = mode === 'light' || (mode === 'system' && sys === 'light');
  const value = useMemo(() => ({ mode, light, setMode }), [mode, light, setMode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

export const modeLabel = (m: Mode) => (m === 'system' ? 'Automatic' : m === 'dark' ? 'Dark' : 'Light');
