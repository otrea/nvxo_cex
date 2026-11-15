import { SUSE_400Regular, SUSE_500Medium, SUSE_600SemiBold, SUSE_700Bold } from '@expo-google-fonts/suse';
import { SUSEMono_400Regular, SUSEMono_500Medium, SUSEMono_700Bold } from '@expo-google-fonts/suse-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/Toast';
import { BG, ThemeProvider, useTheme } from '@/theme/theme';
import { LangProvider } from '@/i18n/i18n';
import { Onest_400Regular, Onest_500Medium, Onest_600SemiBold, Onest_700Bold } from '@expo-google-fonts/onest';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { light } = useTheme();
  const bg = light ? BG.light : BG.dark;
  useEffect(() => { SystemUI.setBackgroundColorAsync(bg).catch(() => {}); }, [bg]);
  return (
    <ToastProvider>
      <StatusBar style={light ? 'dark' : 'light'} />
      <Stack
        screenOptions={({ route }) => ({
          headerShown: false,
          contentStyle: { backgroundColor: bg },
          animation: ((route.params as { a?: string } | undefined)?.a ?? 'slide_from_right') as any,
          gestureEnabled: true,
        })}
      />
    </ToastProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SUSE_400Regular, SUSE_500Medium, SUSE_600SemiBold, SUSE_700Bold,
    SUSEMono_400Regular, SUSEMono_500Medium, SUSEMono_700Bold,
    // Russian: Cyrillic-capable faces (SUSE has no Cyrillic)
    Onest_400Regular, Onest_500Medium, Onest_600SemiBold, Onest_700Bold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold,
    // v3 icons: Material Symbols Sharp, subset by tools/build-icons.py
    MaterialSymbolsSharp: require('../../assets/fonts/MaterialSymbolsSharp.ttf'),
  });
  useEffect(() => { if (loaded || error) SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LangProvider>
          <Shell />
        </LangProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
