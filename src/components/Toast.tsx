import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/theme';

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [op] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { light } = useTheme();

  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(op, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMsg(null));
    }, 1800);
  }, [op]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: insets.bottom + 96 }]}>
          <Animated.View style={[styles.toast, light ? styles.tl : styles.td, { opacity: op }]}>
            <Text style={[styles.txt, { color: light ? '#FFFFFF' : '#000000' }]}>{msg}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastCtx.Provider>
  );
}

const styles = StyleSheet.create({
  toast: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, maxWidth: 340 },
  td: { backgroundColor: '#FFFFFF' },
  tl: { backgroundColor: '#000019' },
  txt: { fontFamily: 'SUSE_500Medium', fontSize: 14, textAlign: 'center' },
});
