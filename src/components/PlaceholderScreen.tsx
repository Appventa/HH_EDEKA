import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useBrand } from '@/theme/ThemeProvider';

/** Used for screens not yet built — keeps the tab shell navigable. */
export function PlaceholderScreen({ title, hint }: { title: string; hint?: string }) {
  const brand = useBrand();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: brand.colors.background }]}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {hint && (
        <ThemedText type="default" color="textSecondary" style={styles.hint}>
          {hint}
        </ThemedText>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
  },
  hint: {
    textAlign: 'center',
  },
});
