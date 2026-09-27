import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Caveat_600SemiBold, Caveat_700Bold } from "@expo-google-fonts/caveat";
import { ArefRuqaa_700Bold } from "@expo-google-fonts/aref-ruqaa";
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import "@/lib/_core/nativewind-pressable";
import { BrandIntro } from "@/components/brand-intro";
import { StudySpaceGate } from "@/components/study-space-gate";
import { ThemePreferenceSync } from "@/components/theme-preference-sync";
import { ThemeProvider } from "@/lib/theme-provider";
import { DarsProvider } from "@/lib/dars-context";
import { I18nProvider } from "@/lib/i18n";
import { observeReminderResponses } from "@/lib/reminders";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

SplashScreen.setOptions({ duration: 520, fade: true });
void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  const [fontsLoaded, fontError] = useFonts({
    Caveat_600SemiBold,
    Caveat_700Bold,
    ArefRuqaa_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const fontsReady = fontsLoaded || Boolean(fontError);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);
  useEffect(() => {
    if (!fontsReady) return;
    const timer = setTimeout(() => { void SplashScreen.hideAsync(); }, 16);
    return () => clearTimeout(timer);
  }, [fontsReady]);
  useEffect(() => observeReminderResponses((classId) => router.push(`/class/${classId}` as never)), []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <DarsProvider>
          <ThemePreferenceSync />
          <I18nProvider>
          <StudySpaceGate>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
          <Stack screenOptions={{ headerShown: false, animation: Platform.OS === "ios" ? "ios_from_right" : "slide_from_right", animationDuration: 280, gestureEnabled: true, fullScreenGestureEnabled: true }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="class/[id]" />
            <Stack.Screen name="class/form" options={{ presentation: "modal", animation: "slide_from_bottom", animationDuration: 320 }} />
            <Stack.Screen name="teacher/[id]" />
            <Stack.Screen name="teacher/form" options={{ presentation: "modal", animation: "slide_from_bottom", animationDuration: 320 }} />
            <Stack.Screen name="book/[id]" />
            <Stack.Screen name="book/form" options={{ presentation: "modal", animation: "slide_from_bottom", animationDuration: 320 }} />
            <Stack.Screen name="location/[id]" />
            <Stack.Screen name="location/form" options={{ presentation: "modal", animation: "slide_from_bottom", animationDuration: 320 }} />
            <Stack.Screen name="books" />
            <Stack.Screen name="locations" />
            <Stack.Screen name="search" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="oauth/callback" />
          </Stack>
          <StatusBar style="auto" />
          <BrandIntro />
          </StudySpaceGate>
          </I18nProvider>
          </DarsProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (!fontsReady) return null;

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
