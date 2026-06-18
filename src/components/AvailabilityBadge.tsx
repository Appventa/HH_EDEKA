import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { BrandColors } from '@/brands';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';

type Colors = Pick<BrandColors, 'success' | 'error'>;

/** Shows store-availability for a product, given the branch IDs it's in stock at. */
export function AvailabilityBadge({
  availableBranchIds,
  branchCount,
  colors,
}: {
  availableBranchIds: string[] | undefined;
  branchCount: number;
  colors: Colors;
}) {
  if (!availableBranchIds || branchCount === 0) return null;

  const count = availableBranchIds.length;

  if (count === 0) {
    return (
      <View style={styles.row}>
        <Ionicons name="close-circle-outline" size={14} color={colors.error} />
        <ThemedText type="small" style={[styles.text, { color: colors.error }]}>
          {strings.liste.notAvailable}
        </ThemedText>
      </View>
    );
  }

  if (count === branchCount) {
    return (
      <View style={styles.row}>
        <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
        <ThemedText type="small" style={[styles.text, { color: colors.success }]}>
          {strings.liste.availableInAll}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Ionicons name="storefront-outline" size={14} color={colors.success} />
      <ThemedText type="small" style={[styles.text, { color: colors.success }]}>
        {strings.liste.availableInSome(count, branchCount)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
