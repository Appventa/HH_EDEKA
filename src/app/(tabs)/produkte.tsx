import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationBar } from '@/components/LocationBar';
import { ProductImage } from '@/components/ProductImage';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getOffers } from '@/data/services/offers';
import { Offer } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function ProdukteScreen() {
  const brand = useBrand();
  const navigation = useNavigation();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const addItem = useShoppingListStore((state) => state.addItem);
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Pre-fill search when arriving from Inventar, then clear the param
  useEffect(() => {
    if (q) {
      setQuery(q);
      router.setParams({ q: undefined });
    }
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    getOffers(brandId).then((data) => {
      if (!cancelled) setOffers(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <SearchBar value={query} onChangeText={setQuery} placeholder={strings.angebote.searchPlaceholder} />
      ),
      headerTitleContainerStyle: { flex: 1 },
      headerRight: () => (
        <View style={styles.headerRightRow}>
          <Pressable onPress={() => router.push('/scanner')} hitSlop={8} style={styles.headerIconButton}>
            <Ionicons name="scan-outline" size={22} color={brand.colors.accent} />
          </Pressable>
          <Pressable onPress={() => router.push('/profil')} hitSlop={8} style={styles.headerIconButton}>
            <Ionicons name="person-circle-outline" size={26} color={brand.colors.text} />
          </Pressable>
        </View>
      ),
      headerRightContainerStyle: { flexGrow: 0, flexBasis: 'auto' },
    });
  }, [navigation, query, brand.colors]);

  const categories = useMemo(() => {
    if (!offers) return [];
    return Array.from(new Set(offers.map((offer) => offer.category)));
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    const byCategory = category ? offers.filter((offer) => offer.category === category) : offers;
    const q = query.trim().toLowerCase();
    return q ? byCategory.filter((offer) => offer.title.toLowerCase().includes(q)) : byCategory;
  }, [offers, category, query]);

  const handleAdd = (offer: Offer) => {
    addItem(brandId, { ...offer, availableBranchIds: offer.branchIds });
    setAddedId(offer.id);
    setTimeout(() => setAddedId((current) => (current === offer.id ? null : current)), 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <View style={styles.body}>
        {offers === null ? (
          <View style={styles.content}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={[styles.skeleton, { backgroundColor: brand.colors.surface }]} />
            ))}
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
              <CategoryChip
                label={strings.angebote.allCategories}
                active={category === null}
                colors={brand.colors}
                onPress={() => setCategory(null)}
              />
              {categories.map((cat) => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  active={category === cat}
                  colors={brand.colors}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.content}>
              {filteredOffers.length === 0 ? (
                <ThemedText type="small" color="textSecondary" style={styles.noResults}>
                  {strings.common.noResults}
                </ThemedText>
              ) : (
                filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    colors={brand.colors}
                    added={addedId === offer.id}
                    onAdd={() => handleAdd(offer)}
                  />
                ))
              )}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function CategoryChip({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: { accent: string; surface: string; border: string; textOnAccent: string; text: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <ThemedText style={[styles.chipText, { color: active ? colors.textOnAccent : colors.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function OfferCard({
  offer,
  colors,
  added,
  onAdd,
}: {
  offer: Offer;
  colors: { surface: string; border: string; accent: string; textOnAccent: string; success: string };
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        style={styles.cardMain}
        onPress={() =>
          router.push({
            pathname: '/produkt',
            params: {
              imageId: offer.imageId,
              title: offer.title,
              price: String(offer.price),
              unit: offer.unit,
              category: offer.category,
            },
          })
        }
      >
        <ThemedText type="smallBold" numberOfLines={1}>
          {offer.title}
        </ThemedText>

        <View style={styles.cardBodyRow}>
          <ProductImage
            imageId={offer.imageId}
            category={offer.category}
            size={72}
            iconColor={colors.accent}
            backgroundColor={colors.border}
            style={styles.iconWrap}
          />

          <View style={styles.cardInfo}>
            <ThemedText type="small" color="textSecondary" numberOfLines={2}>
              {offer.description}
            </ThemedText>
            <ThemedText type="small" color="textSecondary">
              {strings.angebote.validUntil(formatDate(offer.validUntil))}
            </ThemedText>
          </View>
        </View>
      </Pressable>

      <View style={styles.cardFooter}>
        <View style={styles.priceRow}>
          <ThemedText type="subtitle" color="accent">
            {offer.price.toFixed(2).replace('.', ',')} €
          </ThemedText>
          <ThemedText type="small" color="textSecondary">
            {offer.unit}
          </ThemedText>
        </View>

        <Pressable
          onPress={onAdd}
          style={[styles.addButton, { backgroundColor: added ? colors.success : colors.accent }]}
        >
          <Ionicons name={added ? 'checkmark' : 'add'} size={18} color={colors.textOnAccent} />
          <ThemedText style={[styles.addButtonText, { color: colors.textOnAccent }]}>
            {added ? strings.angebote.added : strings.angebote.addToList}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: Spacing.three,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    alignItems: 'flex-start',
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  skeleton: {
    height: 175,
    borderRadius: 16,
  },
  noResults: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    paddingHorizontal: Spacing.two,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardMain: {
    gap: Spacing.two,
  },
  cardBodyRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: 2,
    minWidth: 64,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
