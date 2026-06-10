import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BrandThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BrandThemeProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="brand-picker" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="rechnungen" options={{ headerShown: true, title: 'Rechnungen' }} />
          <Stack.Screen name="profil" options={{ headerShown: true, title: 'Profil' }} />
        </Stack>
      </BrandThemeProvider>
    </GestureHandlerRootView>
  );
}
