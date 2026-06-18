import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeroBanner } from '@/components/HeroBanner';
import { LocationBar } from '@/components/LocationBar';
import { ProductImage } from '@/components/ProductImage';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { computeStatus, getInventory, getPosReport, InventoryStatus } from '@/data/services/inventory';
import { getOffers } from '@/data/services/offers';
import { InventoryItem, Offer, PosReport } from '@/data/types';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';
import { useCartStore } from '@/state/useCartStore';
import { useInventoryStore } from '@/state/useInventoryStore';
import { useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrand } from '@/theme/ThemeProvider';

// ─── inventory alert widget ───────────────────────────────────────────

function InventoryAlertWidget({ criticalItems, onDismiss }: { criticalItems: InventoryStatus[]; onDismiss: () => void }) {
  const brand = useBrand();
  if (criticalItems.length === 0) return null;

  return (
    <Pressable
      onPress={() => { onDismiss(); router.push('/(tabs)/inventar'); }}
      style={[styles.alertWidget, { backgroundColor: brand.colors.error + '12', borderColor: brand.colors.error + '40' }]}
    >
      <View style={[styles.alertIconWrap, { backgroundColor: brand.colors.error + '20' }]}>
        <Ionicons name="warning-outline" size={18} color={brand.colors.error} />
      </View>
      <View style={styles.flex1}>
        <ThemedText type="smallBold" style={{ color: brand.colors.error }}>
          {criticalItems.length} {criticalItems.length === 1 ? 'Artikel' : 'Artikel'} · kritischer Bestand
        </ThemedText>
        <ThemedText type="small" color="textSecondary">
          {strings.start.inventoryAlertHint}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={brand.colors.error} />
    </Pressable>
  );
}

// ─── notification helper ──────────────────────────────────────────────

async function scheduleInventoryAlert(criticalItems: InventoryStatus[]) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.setNotificationChannelAsync('inventory-alerts', {
      name: 'Lagerbestand Warnungen',
      importance: Notifications.AndroidImportance.HIGH,
    });

    const names = criticalItems.map((s) => s.item.name).join(', ');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠ ${criticalItems.length} Artikel kritisch`,
        body: `${names} · Nachbestellen empfohlen`,
        data: { route: '/(tabs)/inventar' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, repeats: false },
    });
  } catch {
    // notification permission denied or scheduling failed — silent fail
  }
}

const TILES = [
  { key: 'karte', label: strings.start.tileKarte, icon: 'card-outline' as const, route: '/(tabs)/karte' as const },
  { key: 'scanner', label: strings.start.tileScannerAway, icon: 'scan-outline' as const, route: '/(tabs)/scanner' as const },
  { key: 'rechnungen', label: strings.start.tileRechnungen, icon: 'document-text-outline' as const, route: '/rechnungen' as const },
  { key: 'rueckverguetung', label: strings.start.tileRueckverguetung, icon: 'cash-outline' as const, route: '/rueckverguetung' as const },
];

function OfferCard({ offer, onPress }: { offer: Offer; onPress: () => void }) {
  const brand = useBrand();
  return (
    <Pressable
      style={[styles.offerCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
      onPress={onPress}
    >
      <View style={styles.offerCardHeader}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.offerCardTitle}>
          {offer.title}
        </ThemedText>
        {offer.discountPercent ? (
          <View style={[styles.discountBadge, { backgroundColor: brand.colors.success }]}>
            <ThemedText type="smallBold" style={[styles.discountBadgeText, styles.discountBadgeTextColor]}>
              -{offer.discountPercent}%
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.offerCardBodyRow}>
        <ProductImage
          imageId={offer.imageId}
          category={offer.category}
          size={64}
          iconColor={brand.colors.accent}
          backgroundColor={brand.colors.border}
        />

        <View style={styles.offerCardPriceInfo}>
          <ThemedText type="smallBold" color="accent">
            {offer.price.toFixed(2).replace('.', ',')} €
          </ThemedText>
          <ThemedText type="small" color="textSecondary" numberOfLines={1}>
            {offer.unit}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function OfferCardSkeleton() {
  const brand = useBrand();
  return <View style={[styles.offerCardSkeleton, { backgroundColor: brand.colors.surface }]} />;
}

function OfferPreviewModal({
  offer,
  added,
  onAdd,
  onClose,
}: {
  offer: Offer | null;
  added: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const brand = useBrand();
  if (!offer) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
          onPress={() => {}}
        >
          <View style={styles.offerCardHeader}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.offerCardTitle}>
              {offer.title}
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={brand.colors.textSecondary} />
            </Pressable>
          </View>

          <Pressable
            style={styles.modalBodyRow}
            onPress={() => {
              onClose();
              router.push({
                pathname: '/produkt',
                params: {
                  imageId: offer.imageId,
                  title: offer.title,
                  price: String(offer.price),
                  unit: offer.unit,
                  category: offer.category,
                },
              });
            }}
          >
            <ProductImage
              imageId={offer.imageId}
              category={offer.category}
              size={96}
              iconColor={brand.colors.accent}
              backgroundColor={brand.colors.border}
            />
            <View style={styles.modalInfo}>
              <ThemedText type="small" color="textSecondary" numberOfLines={4}>
                {offer.description}
              </ThemedText>
              <ThemedText type="small" color="textSecondary">
                {strings.angebote.validUntil(formatDate(offer.validUntil))}
              </ThemedText>
            </View>
          </Pressable>

          <View style={styles.modalFooter}>
            <View style={styles.modalPriceRow}>
              <ThemedText type="subtitle" color="accent">
                {offer.price.toFixed(2).replace('.', ',')} €
              </ThemedText>
              <ThemedText type="small" color="textSecondary">
                {offer.unit}
              </ThemedText>
            </View>

            <Pressable
              onPress={onAdd}
              style={[
                styles.offerAddButton,
                styles.modalAddButton,
                { backgroundColor: added ? brand.colors.success : brand.colors.accent },
              ]}
            >
              <Ionicons name={added ? 'checkmark' : 'add'} size={16} color={brand.colors.textOnAccent} />
              <ThemedText type="small" style={[styles.offerAddButtonText, { color: brand.colors.textOnAccent }]}>
                {added ? strings.angebote.added : strings.angebote.addToList}
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

export default function StartScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const userName = useAuthStore((state) => state.userName) ?? 'Herr Shah';
  const inStore = useCartStore((state) => state.mode[brandId]) === 'instore';
  const addItem = useShoppingListStore((state) => state.addItem);

  const additions = useInventoryStore((state) => state.additions);
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[] | null>(null);
  const [posReportData, setPosReportData] = useState<PosReport | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const notificationFired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getOffers(brandId).then((data) => {
      if (!cancelled) setOffers(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  // Load global inventory once — not brand-specific
  useEffect(() => {
    let cancelled = false;
    Promise.all([getInventory(), getPosReport()]).then(([inv, pos]) => {
      if (cancelled) return;
      setInventoryData(inv as InventoryItem[]);
      setPosReportData(pos as PosReport);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const criticalItems = useMemo(() => {
    if (!inventoryData || !posReportData) return [] as InventoryStatus[];
    return computeStatus(inventoryData, posReportData, additions).filter((s) => s.daysRemaining < 1);
  }, [inventoryData, posReportData, additions]);

  // Schedule a local push notification once per session when critical items are found
  useEffect(() => {
    if (criticalItems.length === 0 || notificationFired.current) return;
    notificationFired.current = true;
    scheduleInventoryAlert(criticalItems);
  }, [criticalItems]);

  const handleAdd = (offer: Offer) => {
    addItem(brandId, { ...offer, availableBranchIds: offer.branchIds });
    setAddedId(offer.id);
    setTimeout(() => setAddedId((current) => (current === offer.id ? null : current)), 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle" style={styles.greeting} numberOfLines={1}>
          {strings.start.greeting(userName)}
        </ThemedText>

        {!alertDismissed && (
          <InventoryAlertWidget criticalItems={criticalItems} onDismiss={() => setAlertDismissed(true)} />
        )}

        <HeroBanner brand={brand} />

        <ThemedText type="subtitle" style={[styles.sectionTitle, styles.firstSectionTitle]}>
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
              <Ionicons name={tile.icon} size={24} color={brand.colors.accent} />
              <ThemedText type="smallBold">
                {tile.key === 'scanner' && inStore ? strings.start.tileScannerInStore : tile.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="subtitle" style={[styles.sectionTitle, styles.offersSectionTitle]}>
          {strings.start.offersTeaserGeneral}
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersRow}>
          {offers === null
            ? Array.from({ length: 3 }).map((_, index) => <OfferCardSkeleton key={index} />)
            : offers.slice(0, 5).map((offer) => (
                <OfferCard key={offer.id} offer={offer} onPress={() => setSelectedOffer(offer)} />
              ))}
        </ScrollView>
      </ScrollView>

      <OfferPreviewModal
        offer={selectedOffer}
        added={selectedOffer ? addedId === selectedOffer.id : false}
        onAdd={() => selectedOffer && handleAdd(selectedOffer)}
        onClose={() => setSelectedOffer(null)}
      />
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
    gap: Spacing.two,
  },
  greeting: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: Spacing.three,
  },
  firstSectionTitle: {
    marginTop: 0,
  },
  offersSectionTitle: {
    marginTop: Spacing.one,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  tilePressed: {
    opacity: 0.8,
  },
  offersRow: {
    flexGrow: 0,
  },
  offerCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    marginRight: Spacing.three,
    gap: Spacing.two,
  },
  offerCardSkeleton: {
    width: 220,
    height: 128,
    borderRadius: 16,
    marginRight: Spacing.three,
  },
  offerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  offerCardTitle: {
    flex: 1,
  },
  offerCardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  offerCardPriceInfo: {
    flex: 1,
    gap: 2,
  },
  offerAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: 12,
    paddingVertical: Spacing.two,
  },
  offerAddButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: Spacing.two,
  },
  discountBadgeText: {
    fontSize: 12,
  },
  discountBadgeTextColor: {
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalBodyRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  modalInfo: {
    flex: 1,
    gap: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  modalAddButton: {
    paddingHorizontal: Spacing.three,
  },

  // inventory alert widget — compact 2-liner row
  alertWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  alertIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flex1: { flex: 1 },
});
