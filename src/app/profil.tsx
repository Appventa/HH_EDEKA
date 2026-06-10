import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function ProfilScreen() {
  const brand = useBrand();
  const router = useRouter();
  const businessName = useAuthStore((state) => state.businessName) ?? 'Restaurant Adler';
  const logout = useAuthStore((state) => state.logout);
  const clearBrand = useBrandStore((state) => state.clearBrand);

  const handleSwitchBrand = () => {
    clearBrand();
    router.replace('/brand-picker');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDemoReset = () => {
    Alert.alert(strings.profil.demoReset, strings.profil.demoResetConfirm, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.confirm,
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          logout();
          clearBrand();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: brand.colors.background }]}>
      <Pressable
        onLongPress={handleDemoReset}
        delayLongPress={3000}
        style={[styles.avatar, { backgroundColor: brand.colors.primary }]}
      >
        <Ionicons name="person" size={40} color={brand.colors.textOnPrimary} />
      </Pressable>

      <ThemedText type="title" style={styles.name}>
        {businessName}
      </ThemedText>

      <View style={[styles.section, { borderColor: brand.colors.border }]}>
        <ThemedText type="smallBold" color="textSecondary">
          {strings.profil.accountInfo}
        </ThemedText>
        <ThemedText type="default">{brand.name}</ThemedText>
      </View>

      <Pressable
        onPress={handleSwitchBrand}
        style={[styles.action, { borderColor: brand.colors.border }]}
      >
        <Ionicons name="swap-horizontal-outline" size={20} color={brand.colors.text} />
        <ThemedText type="default">{strings.profil.switchBrand}</ThemedText>
      </Pressable>

      <Pressable onPress={handleLogout} style={[styles.action, { borderColor: brand.colors.border }]}>
        <Ionicons name="log-out-outline" size={20} color={brand.colors.error} />
        <ThemedText type="default" color="error">
          {strings.profil.logout}
        </ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
  },
  section: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  action: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
});
