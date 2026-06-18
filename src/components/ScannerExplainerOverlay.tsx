import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ScanExplainerIllustration } from '@/components/ScanExplainerIllustration';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useBrand } from '@/theme/ThemeProvider';

export function ScannerExplainerOverlay({
  onStart,
  onDontShowAgain,
}: {
  onStart: () => void;
  onDontShowAgain: () => void;
}) {
  const brand = useBrand();

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
      <View style={[styles.card, { backgroundColor: brand.colors.surface }]}>
        <ThemedText type="title" style={styles.title}>
          {strings.scanner.explainerTitle}
        </ThemedText>
        <ThemedText type="default" color="textSecondary" style={styles.hint}>
          {strings.scanner.explainerHint}
        </ThemedText>

        <View style={styles.illustration}>
          <ScanExplainerIllustration color={brand.colors.accent} />
        </View>

        <Pressable
          onPress={onStart}
          style={[styles.startButton, { backgroundColor: brand.colors.accent }]}
        >
          <ThemedText style={[styles.startButtonText, { color: brand.colors.textOnAccent }]}>
            {strings.scanner.explainerStart}
          </ThemedText>
        </Pressable>

        <Pressable onPress={onDontShowAgain} style={styles.dontShowButton}>
          <ThemedText type="small" color="accent">
            {strings.scanner.explainerDontShow}
          </ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    zIndex: 10,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
  },
  illustration: {
    marginVertical: Spacing.four,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dontShowButton: {
    paddingVertical: Spacing.two,
  },
});
