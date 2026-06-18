import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BasketIllustration } from '@/components/BasketIllustration';
import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { getCustomerCard } from '@/data/services/customerCard';
import { resolvePurchaseLinks } from '@/data/services/inventory';
import { buildInvoice } from '@/data/services/invoices';
import { Branch, CustomerCard } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useInventoryStore } from '@/state/useInventoryStore';
import { useInvoiceStore } from '@/state/useInvoiceStore';
import { useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrand } from '@/theme/ThemeProvider';

// ─── delivery tracking ────────────────────────────────────────────────

const DELIVERY_STAGES = [
  { label: 'Lieferung zusammengestellt', status: 'done' as const },
  { label: 'Auf LKW geladen', status: 'active' as const },
  { label: 'Markt verlassen', status: 'upcoming' as const },
  { label: 'Erwartete Ankunft', status: 'upcoming' as const },
  { label: 'Abgeschlossen', status: 'upcoming' as const },
];

type StageColors = { success: string; accent: string; text: string; textSecondary: string; border: string };

function DeliveryStage({
  label,
  status,
  isLast,
  colors,
}: {
  label: string;
  status: 'done' | 'active' | 'upcoming';
  isLast: boolean;
  colors: StageColors;
}) {
  const dotBg =
    status === 'done' ? colors.success : status === 'active' ? colors.accent : 'transparent';
  const labelColor =
    status === 'done' ? colors.success : status === 'active' ? colors.text : colors.textSecondary;
  const lineColor = status === 'done' ? colors.success : colors.border;

  return (
    <View style={stageStyles.wrap}>
      <View style={stageStyles.track}>
        <View
          style={[
            stageStyles.dot,
            { backgroundColor: dotBg },
            status === 'upcoming' && { borderWidth: 1.5, borderColor: colors.border },
          ]}
        >
          {status === 'done' && <Ionicons name="checkmark" size={11} color="#fff" />}
        </View>
        {!isLast && <View style={[stageStyles.line, { backgroundColor: lineColor }]} />}
      </View>
      <ThemedText
        type={status === 'active' ? 'smallBold' : 'small'}
        style={{
          color: labelColor,
          paddingTop: 2,
          paddingBottom: isLast ? 0 : Spacing.three,
          flex: 1,
        }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const stageStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: Spacing.two },
  track: { alignItems: 'center', width: 20 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, minHeight: Spacing.three },
});

// ─── screen ──────────────────────────────────────────────────────────

export default function LieferungScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const items = useShoppingListStore((state) => state.items[brandId]);
  const clear = useShoppingListStore((state) => state.clear);
  const addPurchase = useInventoryStore((state) => state.addPurchase);
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [card, setCard] = useState<CustomerCard | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBranches(brandId), getCustomerCard(brandId)]).then(([branchData, cardData]) => {
      if (cancelled) return;
      setBranches(branchData);
      setCard(cardData);
      setSelectedBranchId((current) => current ?? branchData[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = () => {
    const links = resolvePurchaseLinks(items.map((i) => ({ title: i.title, quantity: i.quantity })));
    if (links.length > 0) addPurchase(links);
    if (selectedBranchId) {
      addInvoice(brandId, buildInvoice(items, selectedBranchId, brandId));
    }
    setSubmitted(true);
    clear(brandId);
  };

  if (submitted) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScreenBackground />
        <LocationBar />
        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successHeader}>
            <View style={[styles.successIconCircle, { backgroundColor: brand.colors.success + '18' }]}>
              <Ionicons name="checkmark-circle" size={48} color={brand.colors.success} />
            </View>
            <ThemedText type="title" style={styles.successTitle}>
              {strings.lieferung.successTitle}
            </ThemedText>
            <ThemedText type="small" color="textSecondary" style={styles.successSubtitle}>
              {strings.lieferung.successHint}
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
            <ThemedText type="smallBold">Liefertermin</ThemedText>
            <View style={styles.deliveryRow}>
              <Ionicons name="calendar-outline" size={15} color={brand.colors.accent} />
              <ThemedText type="small">{dateStr}</ThemedText>
            </View>
            <View style={styles.deliveryRow}>
              <Ionicons name="time-outline" size={15} color={brand.colors.accent} />
              <ThemedText type="small" color="textSecondary">
                Anlieferung: 07:00 – 09:00 Uhr
              </ThemedText>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
            <ThemedText type="smallBold">Lieferstatus</ThemedText>
            <View style={styles.stagesWrap}>
              {DELIVERY_STAGES.map((stage, i) => (
                <DeliveryStage
                  key={stage.label}
                  label={stage.label}
                  status={stage.status}
                  isLast={i === DELIVERY_STAGES.length - 1}
                  colors={brand.colors}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.doneFooter}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.doneButton,
              { borderColor: brand.colors.border },
              pressed && { opacity: 0.6 },
            ]}
          >
            <ThemedText type="small" color="textSecondary">
              {strings.lieferung.done}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScreenBackground />
        <LocationBar />
        <View style={styles.emptyCenter}>
          <BasketIllustration color={brand.colors.accent} />
          <ThemedText type="title" style={styles.centeredTitle}>
            {strings.lieferung.empty}
          </ThemedText>
          <ThemedText type="small" color="textSecondary" style={styles.centeredHint}>
            {strings.lieferung.emptyHint}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" color="textSecondary" style={styles.subtitle}>
          {strings.lieferung.subtitle}
        </ThemedText>

        <View style={[styles.card, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <ThemedText type="smallBold">{strings.lieferung.itemsTitle}</ThemedText>
          {items.map((item) => (
            <View key={item.offerId} style={styles.itemRow}>
              <ThemedText type="small" style={styles.itemTitle}>
                {item.quantity}x {item.title}
              </ThemedText>
              <ThemedText type="small" color="textSecondary">
                {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
              </ThemedText>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: brand.colors.border }]}>
            <ThemedText type="subtitle">{strings.liste.total}</ThemedText>
            <ThemedText type="subtitle" color="accent">
              {total.toFixed(2).replace('.', ',')} €
            </ThemedText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <ThemedText type="smallBold">{strings.lieferung.deliveryAddress}</ThemedText>
          <ThemedText type="small" color="textSecondary">
            {card?.businessName}
          </ThemedText>
          <ThemedText type="small" color="textSecondary">
            {card?.address}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <ThemedText type="smallBold" style={styles.branchLabel}>
            {strings.lieferung.branchLabel}
          </ThemedText>
          {branches.map((branch) => (
            <Pressable
              key={branch.id}
              onPress={() => setSelectedBranchId(branch.id)}
              style={styles.branchRow}
            >
              <Ionicons
                name={selectedBranchId === branch.id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={brand.colors.accent}
              />
              <View style={styles.branchInfo}>
                <ThemedText type="small">{branch.name}</ThemedText>
                <ThemedText type="small" color="textSecondary">
                  {branch.street}, {branch.zip} {branch.city}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: brand.colors.border, backgroundColor: brand.colors.background }]}>
        <Pressable onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: brand.colors.accent }]}>
          <ThemedText style={[styles.submitButtonText, { color: brand.colors.textOnAccent }]}>
            {strings.lieferung.submit}
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

  // ── empty state ──
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  centeredTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  centeredHint: {
    textAlign: 'center',
  },

  // ── success state ──
  successScroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  successHeader: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  successSubtitle: {
    textAlign: 'center',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  stagesWrap: {
    marginTop: Spacing.two,
  },
  doneFooter: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.four,
  },
  doneButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: 20,
    borderWidth: 1,
  },

  // ── main form ──
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  subtitle: {
    marginBottom: Spacing.one,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  itemTitle: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: Spacing.one,
    paddingTop: Spacing.two,
  },
  branchLabel: {
    marginBottom: Spacing.one,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  branchInfo: {
    flex: 1,
    gap: 2,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.three,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
