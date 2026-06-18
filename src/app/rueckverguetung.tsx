import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getLoyalty } from '@/data/services/loyalty';
import { Loyalty } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';
import { getLoyaltyStatus, LOYALTY_TIERS } from '@/utils/loyalty';

function formatCurrency(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RueckverguetungScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;

  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLoyalty(brandId).then((data) => {
      if (!cancelled) setLoyalty(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        {loyalty === null ? (
          <>
            <View style={styles.summaryRow}>
              <View style={[styles.skeletonCard, { backgroundColor: brand.colors.surface }]} />
              <View style={[styles.skeletonCard, { backgroundColor: brand.colors.surface }]} />
            </View>
            <View style={[styles.skeletonCard, styles.skeletonProgress, { backgroundColor: brand.colors.surface }]} />
          </>
        ) : (
          <RueckverguetungContent loyalty={loyalty} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RueckverguetungContent({ loyalty }: { loyalty: Loyalty }) {
  const brand = useBrand();
  const status = getLoyaltyStatus(loyalty.totalSpend);

  return (
    <>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <ThemedText type="small" color="textSecondary">
            {strings.rueckverguetung.totalSpend}
          </ThemedText>
          <ThemedText type="title" style={styles.summaryValue}>
            {formatCurrency(loyalty.totalSpend)} €
          </ThemedText>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <ThemedText type="small" color="textSecondary">
            {strings.rueckverguetung.cashbackSoFar}
          </ThemedText>
          <ThemedText type="title" color="success" style={styles.summaryValue}>
            {formatCurrency(status.cashback)} €
          </ThemedText>
          {status.currentRate > 0 && (
            <ThemedText type="small" color="textSecondary">
              {strings.rueckverguetung.currentRateNote(status.currentRate)}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={[styles.progressCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
        <ThemedText type="smallBold">{strings.rueckverguetung.progressTitle}</ThemedText>
        <View style={[styles.progressTrack, { backgroundColor: brand.colors.background, borderColor: brand.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: brand.colors.success, width: `${status.progress * 100}%` },
            ]}
          />
        </View>
        <ThemedText type="small" color="textSecondary">
          {status.nextTier
            ? strings.rueckverguetung.nextMilestone(
                formatCurrency(status.nextTier.threshold - loyalty.totalSpend),
                status.nextTier.rate,
              )
            : strings.rueckverguetung.maxReached}
        </ThemedText>
      </View>

      <View style={styles.tiersSection}>
        <ThemedText type="smallBold" style={styles.tiersTitle}>
          {strings.rueckverguetung.tiersTitle}
        </ThemedText>
        {LOYALTY_TIERS.map((tier) => {
          const reached = loyalty.totalSpend >= tier.threshold;
          return (
            <View
              key={tier.threshold}
              style={[styles.tierRow, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}
            >
              <Ionicons
                name={reached ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={reached ? brand.colors.success : brand.colors.textSecondary}
              />
              <ThemedText type="default" style={styles.tierLabel}>
                {tier.threshold.toLocaleString('de-DE')} € → {tier.rate}%
              </ThemedText>
              {reached && (
                <ThemedText type="smallBold" color="success">
                  {strings.rueckverguetung.tierReached}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </>
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
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  summaryValue: {
    fontSize: 22,
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  tiersSection: {
    gap: Spacing.two,
  },
  tiersTitle: {
    marginTop: Spacing.one,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  tierLabel: {
    flex: 1,
  },
  skeletonCard: {
    flex: 1,
    height: 88,
    borderRadius: 16,
  },
  skeletonProgress: {
    flex: 0,
    height: 96,
  },
});
