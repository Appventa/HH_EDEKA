import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { Branch } from '@/data/types';
import { getBranches } from '@/data/services/branches';
import { useBrandStore } from '@/state/useBrandStore';
import { useCartStore } from '@/state/useCartStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function StandortScreen() {
  const brand = useBrand();
  const router = useRouter();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const setMode = useCartStore((state) => state.setMode);
  const setActiveBranch = useCartStore((state) => state.setActiveBranch);

  const [branches, setBranches] = useState<Branch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBranches(brandId).then((result) => {
      if (!cancelled) setBranches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const handleAway = () => {
    setMode(brandId, 'planning');
    setActiveBranch(brandId, null);
    router.replace('/(tabs)');
  };

  const handleInStore = (branch: Branch) => {
    setMode(brandId, 'instore');
    setActiveBranch(brandId, branch.id);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {strings.standort.title}
        </ThemedText>
        <ThemedText type="default" color="textSecondary" style={styles.explanation}>
          {strings.standort.explanation}
        </ThemedText>

        <Pressable
          onPress={handleAway}
          style={({ pressed }) => [
            styles.option,
            { backgroundColor: brand.colors.surface, borderColor: brand.colors.border },
            pressed && styles.optionPressed,
          ]}
        >
          <Ionicons name="home-outline" size={28} color={brand.colors.accent} />
          <View style={styles.optionText}>
            <ThemedText type="smallBold">{strings.standort.awayOption}</ThemedText>
            <ThemedText type="small" color="textSecondary">
              {strings.standort.awayHint}
            </ThemedText>
          </View>
        </Pressable>

        {branches === null ? (
          <ActivityIndicator color={brand.colors.accent} style={styles.loading} />
        ) : (
          <Pressable
            onPress={() => handleInStore(branches[0])}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: brand.colors.surface, borderColor: brand.colors.border },
              pressed && styles.optionPressed,
            ]}
          >
            <Ionicons name="storefront-outline" size={28} color={brand.colors.accent} />
            <View style={styles.optionText}>
              <ThemedText type="smallBold">{strings.standort.inStoreLabel}</ThemedText>
              <ThemedText type="small" color="textSecondary">
                {branches[0].name}
              </ThemedText>
            </View>
          </Pressable>
        )}
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
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.one,
  },
  explanation: {
    marginBottom: Spacing.three,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  loading: {
    marginTop: Spacing.three,
  },
});
