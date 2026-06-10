import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getOffers } from '@/data/services/offers';
import { Offer } from '@/data/types';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';

const TILES = [
  { key: 'karte', label: strings.start.tileKarte, icon: 'card-outline' as const, route: '/(tabs)/karte' as const },
  { key: 'maerkte', label: strings.start.tileMaerkte, icon: 'location-outline' as const, route: '/(tabs)/maerkte' as const },
  { key: 'rechnungen', label: strings.start.tileRechnungen, icon: 'document-text-outline' as const, route: '/rechnungen' as const },
  { key: 'scanner', label: strings.start.tileScanner, icon: 'scan-outline' as const, route: '/(tabs)/scanner' as const },
];

export default function StartScreen() {
  const brand = useBrand();
  const router = useRouter();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const businessName = useAuthStore((state) => state.businessName) ?? 'Restaurant Adler';

  const [offers, setOffers] = useState<Offer[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOffers(brandId).then((data) => {
      if (!cancelled) setOffers(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: brand.colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.greeting}>
          {strings.start.greeting(businessName)}
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {strings.start.quickAccess}
        </ThemedText>
        <View style={styles.tiles}>
          {TILES.map((tile) => (
            <Pressable
              key={tile.key}
              onPress={() => router.push(tile.route)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: brand.colors.surface, borderColor: brand.colors.border },
                pressed && styles.tilePressed,
              ]}
            >
              <Ionicons name={tile.icon} size={28} color={brand.colors.accent} />
              <ThemedText type="smallBold">{tile.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {strings.start.offersTeaser}
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersRow}>
          {offers === null
            ? Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.offerCardSkeleton, { backgroundColor: brand.colors.surface }]}
                />
              ))
            : offers.slice(0, 5).map((offer) => (
                <View
                  key={offer.id}
                  style={[styles.offerCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
                >
                  <ThemedText type="smallBold" numberOfLines={2}>
                    {offer.title}
                  </ThemedText>
                  <ThemedText type="default" color="accent">
                    {offer.price.toFixed(2).replace('.', ',')} € {offer.unit}
                  </ThemedText>
                </View>
              ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  greeting: {
    fontSize: 26,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: Spacing.three,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  tilePressed: {
    opacity: 0.8,
  },
  offersRow: {
    flexGrow: 0,
  },
  offerCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    marginRight: Spacing.three,
    gap: Spacing.two,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  offerCardSkeleton: {
    width: 160,
    height: 90,
    borderRadius: 16,
    marginRight: Spacing.three,
  },
});
