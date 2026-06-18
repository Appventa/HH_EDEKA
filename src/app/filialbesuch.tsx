import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/brands';
import { BasketIllustration } from '@/components/BasketIllustration';
import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { Branch } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrand } from '@/theme/ThemeProvider';

interface BranchCoverage extends Branch {
  available: number;
  missing: string[];
}

export default function FilialbesuchScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const items = useShoppingListStore((state) => state.items[brandId]);
  const [branches, setBranches] = useState<Branch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBranches(brandId).then((data) => {
      if (!cancelled) setBranches(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.emptyContainer]} edges={['left', 'right', 'bottom']}>
        <ScreenBackground />
        <LocationBar />
        <BasketIllustration color={brand.colors.accent} />
        <ThemedText type="title" style={styles.emptyTitle}>
          {strings.filialbesuch.empty}
        </ThemedText>
        <ThemedText type="small" color="textSecondary" style={styles.emptyHint}>
          {strings.filialbesuch.emptyHint}
        </ThemedText>
      </SafeAreaView>
    );
  }

  const total = items.length;
  const coverage: BranchCoverage[] = (branches ?? [])
    .map((branch) => {
      const missing = items
        .filter((item) => item.availableBranchIds && !item.availableBranchIds.includes(branch.id))
        .map((item) => item.title);
      return { ...branch, available: total - missing.length, missing };
    })
    .sort((a, b) => b.available - a.available);

  const bestAvailable = coverage[0]?.available ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" color="textSecondary" style={styles.subtitle}>
          {strings.filialbesuch.subtitle}
        </ThemedText>

        {branches === null ? (
          <View style={[styles.skeleton, { backgroundColor: brand.colors.surface }]} />
        ) : (
          coverage.map((branch, index) => (
            <BranchCoverageCard
              key={branch.id}
              branch={branch}
              total={total}
              isBest={index === 0 && bestAvailable > 0}
              colors={brand.colors}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BranchCoverageCard({
  branch,
  total,
  isBest,
  colors,
}: {
  branch: BranchCoverage;
  total: number;
  isBest: boolean;
  colors: BrandColors;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {isBest && (
        <View style={[styles.bestBadge, { backgroundColor: colors.accent }]}>
          <Ionicons name="star" size={12} color={colors.textOnAccent} />
          <ThemedText type="small" style={[styles.bestBadgeText, { color: colors.textOnAccent }]}>
            {strings.filialbesuch.bestMatch}
          </ThemedText>
        </View>
      )}

      <ThemedText type="smallBold">{branch.name}</ThemedText>
      <ThemedText type="small" color="textSecondary">
        {branch.street}, {branch.zip} {branch.city}
      </ThemedText>

      <CoverageRow available={branch.available} total={total} colors={colors} />

      {branch.missing.length > 0 && branch.available > 0 && (
        <View style={[styles.missingSection, { borderTopColor: colors.border }]}>
          <ThemedText type="small" color="textSecondary" style={styles.missingTitle}>
            {strings.filialbesuch.missingItemsTitle}
          </ThemedText>
          {branch.missing.map((title) => (
            <ThemedText key={title} type="small" color="textSecondary">
              · {title}
            </ThemedText>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        <ActionButton
          icon="call-outline"
          label={strings.filialbesuch.call}
          color={colors.accent}
          onPress={() => callBranch(branch)}
        />
        <ActionButton
          icon="navigate-outline"
          label={strings.filialbesuch.route}
          color={colors.accent}
          onPress={() => routeToBranch(branch)}
        />
      </View>
    </View>
  );
}

function CoverageRow({ available, total, colors }: { available: number; total: number; colors: BrandColors }) {
  if (available === total) {
    return (
      <View style={styles.coverageRow}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <ThemedText type="smallBold" color="success">
          {strings.filialbesuch.allAvailable}
        </ThemedText>
      </View>
    );
  }

  if (available === 0) {
    return (
      <View style={styles.coverageRow}>
        <Ionicons name="close-circle" size={16} color={colors.error} />
        <ThemedText type="smallBold" color="error">
          {strings.filialbesuch.noneAvailable}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.coverageRow}>
      <Ionicons name="storefront" size={16} color={colors.accent} />
      <ThemedText type="smallBold" color="accent">
        {strings.filialbesuch.itemsAvailable(available, total)}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionButton} hitSlop={8}>
      <Ionicons name={icon} size={18} color={color} />
      <ThemedText style={[styles.actionLabel, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

function callBranch(branch: Branch) {
  Linking.openURL(`tel:${branch.phone.replace(/\s+/g, '')}`);
}

function routeToBranch(branch: Branch) {
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  subtitle: {
    marginBottom: Spacing.one,
  },
  skeleton: {
    height: 160,
    borderRadius: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 4,
  },
  bestBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.one,
  },
  bestBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  missingSection: {
    borderTopWidth: 1,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    gap: 2,
  },
  missingTitle: {
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
