import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getCustomerCard } from '@/data/services/customerCard';
import { CustomerCard } from '@/data/types';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function ProfilScreen() {
  const brand = useBrand();
  const router = useRouter();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const [card, setCard] = useState<CustomerCard | null>(null);
  const logout = useAuthStore((state) => state.logout);
  const clearBrand = useBrandStore((state) => state.clearBrand);

  useEffect(() => {
    let cancelled = false;
    getCustomerCard(brandId).then((data) => {
      if (!cancelled) setCard(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScreenBackground />
      <LocationBar />
      <View style={styles.body}>
        <Pressable onLongPress={handleDemoReset} delayLongPress={3000} style={styles.avatar}>
          <Image source={require('@/assets/images/person.jpg')} style={styles.avatarImage} />
        </Pressable>

        <ThemedText type="title" style={styles.name}>
          {card?.holderName ?? '—'}
        </ThemedText>

        <View style={[styles.section, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <View style={styles.infoRow}>
            <ThemedText type="smallBold" color="textSecondary">
              {strings.profil.business}
            </ThemedText>
            <ThemedText type="default">{card?.businessName ?? '—'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText type="smallBold" color="textSecondary">
              {strings.profil.address}
            </ThemedText>
            <ThemedText type="default">{card?.address ?? '—'}</ThemedText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/team')}
          style={[styles.action, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
        >
          <Ionicons name="people-outline" size={20} color={brand.colors.text} />
          <ThemedText type="default">{strings.profil.team}</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={[styles.action, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
        >
          <Ionicons name="log-out-outline" size={20} color={brand.colors.error} />
          <ThemedText type="default" color="error">
            {strings.profil.logout}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
  },
  section: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  infoRow: {
    gap: 2,
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
