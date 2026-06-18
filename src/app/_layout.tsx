import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BrandThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

// Show notifications as banners even when the app is in the foreground
// Only show notification banners when the app is in the background —
// while the user is actively in the app the dashboard alert is sufficient.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Navigate to Inventar when user taps a push notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route as string | undefined;
      if (route) router.push(route as never);
    });
    return () => sub.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BrandThemeProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="brand-picker" />
          <Stack.Screen name="brand-loading" />
          <Stack.Screen name="login" />
          <Stack.Screen name="standort" options={{ presentation: 'modal' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="rechnungen" options={{ headerShown: true, title: 'Rechnungen' }} />
          <Stack.Screen name="profil" options={{ headerShown: true, title: 'Profil' }} />
          <Stack.Screen name="team" options={{ headerShown: true, title: 'Digitale Einkaufsvollmacht' }} />
          <Stack.Screen name="rueckverguetung" options={{ headerShown: true, title: 'Rückvergütung' }} />
          <Stack.Screen name="produkt" options={{ headerShown: true, title: 'Produktbeschreibung' }} />
          <Stack.Screen name="filialbesuch" options={{ headerShown: true, title: 'Filialbesuch planen' }} />
          <Stack.Screen name="lieferung" options={{ headerShown: true, title: 'Lieferung anfragen' }} />
        </Stack>
      </BrandThemeProvider>
    </GestureHandlerRootView>
  );
}
