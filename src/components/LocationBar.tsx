import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { useBrandStore } from '@/state/useBrandStore';
import { useCartStore } from '@/state/useCartStore';
import { useBrand } from '@/theme/ThemeProvider';

export function LocationBar() {
  const brand = useBrand();
  const router = useRouter();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const mode = useCartStore((state) => state.mode[brandId]);
  const activeBranchId = useCartStore((state) => state.activeBranchId[brandId]);
  const [branchName, setBranchName] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'instore' || !activeBranchId) {
      setBranchName(null);
      return;
    }
    let cancelled = false;
    getBranches(brandId).then((branches) => {
      if (!cancelled) setBranchName(branches.find((branch) => branch.id === activeBranchId)?.name ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId, mode, activeBranchId]);

  const isInStore = mode === 'instore' && !!branchName;

  return (
    <Pressable
      onPress={() => router.push('/maerkte')}
      style={({ pressed }) => [
        styles.bar,
        isInStore
          ? { backgroundColor: brand.colors.locationBarBackground }
          : { backgroundColor: brand.colors.surface, borderBottomWidth: 1, borderBottomColor: brand.colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={isInStore ? 'location' : 'location-outline'}
        size={16}
        color={isInStore ? brand.colors.textOnPrimary : brand.colors.accent}
      />
      <ThemedText
        style={[styles.text, { color: isInStore ? brand.colors.textOnPrimary : brand.colors.text }]}
      >
        {isInStore ? strings.scanner.youAreHere(branchName!) : strings.tabs.maerkte}
      </ThemedText>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={isInStore ? brand.colors.textOnPrimary : brand.colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
