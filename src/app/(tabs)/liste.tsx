import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityBadge } from '@/components/AvailabilityBadge';
import { BasketIllustration } from '@/components/BasketIllustration';
import { LocationBar } from '@/components/LocationBar';
import { ProductImage } from '@/components/ProductImage';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { getOffers } from '@/data/services/offers';
import { Offer } from '@/data/types';
import { useCartStore } from '@/state/useCartStore';
import { ShoppingListItem, useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function ListeScreen() {
  const brand = useBrand();
  const navigation = useNavigation();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const items = useShoppingListStore((state) => state.items[brandId]);
  const customTitle = useShoppingListStore((state) => state.titles[brandId]);
  const setTitle = useShoppingListStore((state) => state.setTitle);
  const incrementItem = useShoppingListStore((state) => state.incrementItem);
  const decrementItem = useShoppingListStore((state) => state.decrementItem);
  const addItem = useShoppingListStore((state) => state.addItem);
  const clear = useShoppingListStore((state) => state.clear);
  const inStore = useCartStore((state) => state.mode[brandId]) === 'instore';
  const [branchCount, setBranchCount] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<Offer[] | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const displayTitle = customTitle ?? strings.liste.title;

  useEffect(() => {
    let cancelled = false;
    getBranches(brandId).then((data) => {
      if (!cancelled) setBranchCount(data.length);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  useEffect(() => {
    let cancelled = false;
    getOffers(brandId).then((data) => {
      if (!cancelled) setCatalog(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <SearchBar value={query} onChangeText={setQuery} placeholder={strings.liste.searchPlaceholder} />
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

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!catalog || !q) return [];
    return catalog.filter((offer) => offer.title.toLowerCase().includes(q));
  }, [catalog, query]);

  const showSearchResults = query.trim().length > 0;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleShare = () => {
    const lines = items.map((item) => `${item.quantity}x ${item.title} (${item.unit})`);
    Share.share({ message: lines.join('\n') });
  };

  const handleStartEditTitle = () => {
    setDraftTitle(displayTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    const trimmed = draftTitle.trim();
    setTitle(brandId, trimmed.length > 0 ? trimmed : null);
    setIsEditingTitle(false);
  };

  const handleAddFromSearch = (offer: Offer) => {
    addItem(brandId, { ...offer, availableBranchIds: offer.branchIds });
    setAddedId(offer.id);
    setTimeout(() => setAddedId((current) => (current === offer.id ? null : current)), 1500);
  };

  if (showSearchResults) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenBackground />
        <LocationBar />
        <ScrollView contentContainerStyle={styles.content}>
          {searchResults.length === 0 ? (
            <ThemedText type="small" color="textSecondary" style={styles.noResults}>
              {strings.common.noResults}
            </ThemedText>
          ) : (
            searchResults.map((offer) => (
              <SearchResultRow
                key={offer.id}
                offer={offer}
                colors={brand.colors}
                added={addedId === offer.id}
                onAdd={() => handleAddFromSearch(offer)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenBackground />
        <LocationBar />
        <View style={styles.emptyCenter}>
          <BasketIllustration color={brand.colors.accent} />
          <ThemedText type="title" style={styles.emptyTitle}>
            {strings.liste.empty}
          </ThemedText>
          <ThemedText type="small" color="textSecondary">
            {strings.liste.emptyHint}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isEditingTitle ? (
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              onSubmitEditing={handleSaveTitle}
              onBlur={handleSaveTitle}
              autoFocus
              returnKeyType="done"
              placeholder={strings.liste.title}
              placeholderTextColor={brand.colors.textSecondary}
              style={[styles.title, styles.titleInput, { color: brand.colors.text, borderBottomColor: brand.colors.accent }]}
            />
          ) : (
            <ThemedText type="title" style={styles.title} numberOfLines={1}>
              {displayTitle}
            </ThemedText>
          )}
          <Pressable onPress={isEditingTitle ? handleSaveTitle : handleStartEditTitle} hitSlop={8}>
            <Ionicons name={isEditingTitle ? 'checkmark' : 'pencil-outline'} size={20} color={brand.colors.accent} />
          </Pressable>
        </View>
        <Pressable onPress={handleShare} hitSlop={8}>
          <Ionicons name="share-outline" size={24} color={brand.colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => (
          <ListRow
            key={item.offerId}
            item={item}
            colors={brand.colors}
            branchCount={branchCount}
            inStore={inStore}
            onIncrement={() => incrementItem(brandId, item.offerId)}
            onDecrement={() => decrementItem(brandId, item.offerId)}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: brand.colors.border, backgroundColor: brand.colors.background }]}>
        <View style={styles.totalRow}>
          <ThemedText type="subtitle">{strings.liste.total}</ThemedText>
          <ThemedText type="subtitle" color="accent">
            {total.toFixed(2).replace('.', ',')} €
          </ThemedText>
        </View>

        <View style={styles.actionsRow}>
          {inStore ? (
            <Pressable
              onPress={() => router.push('/kasse')}
              style={[styles.actionButton, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
            >
              <Ionicons name="card-outline" size={20} color={brand.colors.accent} />
              <ThemedText type="smallBold" style={styles.actionButtonText}>
                {strings.liste.checkoutInStore}
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/filialbesuch')}
              style={[styles.actionButton, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
            >
              <Ionicons name="storefront-outline" size={20} color={brand.colors.accent} />
              <ThemedText type="smallBold" style={styles.actionButtonText}>
                {strings.liste.planVisit}
              </ThemedText>
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push('/lieferung')}
            style={[styles.actionButton, { backgroundColor: brand.colors.accent, borderColor: brand.colors.accent }]}
          >
            <Ionicons name="cube-outline" size={20} color={brand.colors.textOnAccent} />
            <ThemedText type="smallBold" style={[styles.actionButtonText, { color: brand.colors.textOnAccent }]}>
              {strings.liste.requestDelivery}
            </ThemedText>
          </Pressable>
        </View>

        <Pressable onPress={() => clear(brandId)} style={styles.clearButton}>
          <ThemedText type="small" color="textSecondary">
            {strings.liste.clear}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ListRow({
  item,
  colors,
  branchCount,
  inStore,
  onIncrement,
  onDecrement,
}: {
  item: ShoppingListItem;
  colors: { surface: string; border: string; accent: string; text: string; success: string; error: string; textOnAccent: string };
  branchCount: number;
  inStore: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        style={styles.rowMain}
        onPress={() =>
          router.push({
            pathname: '/produkt',
            params: {
              imageId: item.imageId,
              title: item.title,
              price: String(item.price),
              unit: item.unit,
              category: item.category,
            },
          })
        }
      >
        <ThemedText type="smallBold" numberOfLines={1}>
          {item.title}
        </ThemedText>

        <View style={styles.rowBodyRow}>
          <ProductImage
            imageId={item.imageId}
            category={item.category}
            size={56}
            iconColor={colors.accent}
            backgroundColor={colors.border}
          />

          <View style={styles.rowInfo}>
            <ThemedText type="small" color="textSecondary">
              <ThemedText type="smallBold" color="textSecondary">
                {item.price.toFixed(2).replace('.', ',')} €
              </ThemedText>
              {' / '}
              {item.unit.replace(/^pro\s+/i, '')}
            </ThemedText>
            {!inStore && (
              <AvailabilityBadge
                availableBranchIds={item.availableBranchIds}
                branchCount={branchCount}
                colors={colors}
              />
            )}
          </View>

          <View style={styles.stepper}>
            <Pressable onPress={onDecrement} style={[styles.stepperButton, { borderColor: colors.border }]} hitSlop={8}>
              <Ionicons name="remove" size={16} color={colors.text} />
            </Pressable>
            <ThemedText type="smallBold" style={styles.quantity}>
              {item.quantity}
            </ThemedText>
            <Pressable onPress={onIncrement} style={[styles.stepperButton, { borderColor: colors.border }]} hitSlop={8}>
              <Ionicons name="add" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function SearchResultRow({
  offer,
  colors,
  added,
  onAdd,
}: {
  offer: Offer;
  colors: { surface: string; border: string; accent: string; text: string; success: string; error: string; textOnAccent: string };
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText type="smallBold" numberOfLines={1}>
        {offer.title}
      </ThemedText>

      <View style={styles.rowBodyRow}>
        <ProductImage
          imageId={offer.imageId}
          category={offer.category}
          size={56}
          iconColor={colors.accent}
          backgroundColor={colors.border}
        />

        <View style={styles.rowInfo}>
          <ThemedText type="small" color="textSecondary">
            <ThemedText type="smallBold" color="textSecondary">
              {offer.price.toFixed(2).replace('.', ',')} €
            </ThemedText>
            {' / '}
            {offer.unit.replace(/^pro\s+/i, '')}
          </ThemedText>
        </View>

        <Pressable
          onPress={onAdd}
          style={[styles.searchAddButton, { backgroundColor: added ? colors.success : colors.accent }]}
        >
          <Ionicons name={added ? 'checkmark' : 'add'} size={20} color={colors.textOnAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 26,
    flexShrink: 1,
  },
  titleInput: {
    flex: 1,
    paddingVertical: 0,
    borderBottomWidth: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rowMain: {
    gap: Spacing.two,
  },
  rowBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    minWidth: 20,
    textAlign: 'center',
  },
  searchAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  actionButtonText: {
    fontSize: 13,
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: Spacing.one,
  },
});
