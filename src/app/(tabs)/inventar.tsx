import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/brands/types';
import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { computeStatus, getInventory, getPosReport, InventoryStatus } from '@/data/services/inventory';
import { InventoryItem, PosReport } from '@/data/types';
import { useInventoryStore } from '@/state/useInventoryStore';
import { useBrand } from '@/theme/ThemeProvider';

const CATEGORY_ICONS: Record<string, string> = {
  'Obst & Gemüse': 'leaf-outline',
  Molkereiprodukte: 'egg-outline',
  Fleisch: 'restaurant-outline',
  Fisch: 'fish-outline',
  Getränke: 'wine-outline',
  Trockenwaren: 'layers-outline',
  'Öle & Saucen': 'water-outline',
  'Gewürze & Brühen': 'flame-outline',
  Backwaren: 'nutrition-outline',
};

// ─── helpers ─────────────────────────────────────────────────────────

export function fmtQty(amount: number, unit: string): string {
  const n = Math.abs(amount);
  if (unit === 'g' && n >= 1000) return `${(amount / 1000).toFixed(1).replace('.', ',')} kg`;
  if (unit === 'ml' && n >= 1000) return `${(amount / 1000).toFixed(1).replace('.', ',')} L`;
  return `${Math.round(amount)} ${unit}`;
}

export function fmtDays(days: number): string {
  if (days === Infinity) return '–';
  if (days < 1) return '< 1 Tag';
  const d = Math.floor(days);
  return `~${d} ${d === 1 ? 'Tag' : 'Tage'}`;
}

export function barColor(days: number, errorColor: string, successColor: string): string {
  if (days < 1) return errorColor;
  if (days < 2) return '#F97316';
  if (days < 3) return '#EAB308';
  return successColor;
}

// ─── POS summary card ─────────────────────────────────────────────────

function PosSection({ report, colors }: { report: PosReport; colors: BrandColors }) {
  const [expanded, setExpanded] = useState(false);
  const totalDishes = report.entries.reduce((sum, e) => sum + e.soldCount, 0);
  const parts = report.date.split('-');
  const dateStr = `${parts[2]}.${parts[1]}.${parts[0]}`;

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.posHeader}>
        <View style={[styles.posIconWrap, { backgroundColor: colors.accent + '1A' }]}>
          <Ionicons name="receipt-outline" size={18} color={colors.accent} />
        </View>
        <View style={styles.flex1}>
          <ThemedText type="smallBold">{strings.inventar.posTitle}</ThemedText>
          <ThemedText type="small" color="textSecondary">
            {dateStr} · {totalDishes} Gerichte
          </ThemedText>
        </View>
        {report.totalRevenue != null && (
          <ThemedText type="smallBold" style={{ color: colors.accent }}>
            {report.totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </ThemedText>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textSecondary}
        />
      </View>
      {expanded &&
        report.entries.map((entry) => (
          <View key={entry.id} style={styles.posEntry}>
            <View style={[styles.posDot, { backgroundColor: colors.accent }]} />
            <ThemedText type="small" style={styles.flex1} numberOfLines={1}>
              {entry.dishName}
            </ThemedText>
            <ThemedText type="smallBold" color="textSecondary">
              {entry.soldCount}×
            </ThemedText>
          </View>
        ))}
    </Pressable>
  );
}

// ─── inventory item card ──────────────────────────────────────────────

function InventoryCard({ status, colors }: { status: InventoryStatus; colors: BrandColors }) {
  const { item, usedToday, remaining, pct, daysRemaining } = status;
  const icon = (CATEGORY_ICONS[item.category] ?? 'cube-outline') as React.ComponentProps<typeof Ionicons>['name'];
  const color = barColor(daysRemaining, colors.error, colors.success);
  const isCritical = daysRemaining < 1;
  const hasProduct = !!item.productImageId;

  const handlePress = () => {
    if (!item.productImageId) return;
    // Navigate to the Products tab with the item's core name pre-filled as search query
    const searchQuery = item.name.split(/[\s(]/)[0];
    router.navigate({
      pathname: '/(tabs)/produkte',
      params: { q: searchQuery },
    });
  };

  return (
    <Pressable
      onPress={hasProduct ? handlePress : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && hasProduct && { opacity: 0.75 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: colors.border }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.flex1}>
          <ThemedText type="smallBold">{item.name}</ThemedText>
          <ThemedText type="small" color="textSecondary" numberOfLines={1}>
            {item.category} · {item.purchaseNote}
          </ThemedText>
        </View>
        <ThemedText style={[styles.pctLabel, { color }]}>{Math.round(pct)}%</ThemedText>
        {hasProduct && (
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        )}
      </View>

      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View style={{ flex: pct, height: 8, backgroundColor: color }} />
        <View style={{ flex: Math.max(0, 100 - pct), height: 8 }} />
      </View>

      <View style={styles.statsRow}>
        <ThemedText type="small" color="textSecondary">
          {fmtQty(usedToday, item.unit)} verbraucht
        </ThemedText>
        <ThemedText type="small" color="textSecondary">
          {fmtQty(remaining, item.unit)} verbleibend
        </ThemedText>
        <ThemedText type="small" style={{ color }}>
          {fmtDays(daysRemaining)}
        </ThemedText>
      </View>

      {isCritical && (
        <View style={[styles.alertBanner, { backgroundColor: colors.error + '18' }]}>
          <Ionicons name="warning-outline" size={14} color={colors.error} />
          <ThemedText style={[styles.alertText, { color: colors.error }]}>
            {strings.inventar.criticalAlert} · {fmtQty(remaining, item.unit)} verbleibend, tägl. Bedarf {fmtQty(usedToday, item.unit)}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

// ─── screen ──────────────────────────────────────────────────────────

export default function InventarScreen() {
  const brand = useBrand();
  const navigation = useNavigation();
  const additions = useInventoryStore((state) => state.additions);
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
  const [posReport, setPosReport] = useState<PosReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getInventory(), getPosReport()]).then(([inv, pos]) => {
      if (!cancelled) {
        setInventory(inv);
        setPosReport(pos);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <ThemedText type="subtitle">{strings.inventar.title}</ThemedText>,
    });
  }, [navigation]);

  const statusList = useMemo(() => {
    if (!inventory || !posReport) return null;
    return computeStatus(inventory, posReport, additions);
  }, [inventory, posReport, additions]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      {statusList === null ? (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: brand.colors.surface }]} />
          ))}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="small" color="textSecondary">
            {strings.inventar.posSection}
          </ThemedText>
          <PosSection report={posReport!} colors={brand.colors} />
          <ThemedText type="small" color="textSecondary" style={styles.sectionGap}>
            {strings.inventar.stockSection}
          </ThemedText>
          {statusList.map((status) => (
            <InventoryCard key={status.item.id} status={status} colors={brand.colors} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  skeletonWrap: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  skeleton: { height: 120, borderRadius: 16 },
  sectionGap: { marginTop: Spacing.one },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flex1: { flex: 1 },
  pctLabel: { fontSize: 16, fontWeight: '800', textAlign: 'right', minWidth: 36 },

  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.one },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  alertText: { fontSize: 12, fontWeight: '600', flex: 1 },

  posHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  posIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  posEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: 44,
  },
  posDot: { width: 5, height: 5, borderRadius: 3 },
});
