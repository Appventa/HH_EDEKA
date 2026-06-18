import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { strings } from '@/constants/strings';
import { useBrand } from '@/theme/ThemeProvider';

const FILL_DURATION = 600;
const TOTAL_DURATION = 1400;

export default function BrandLoadingScreen() {
  const router = useRouter();
  const brand = useBrand();

  const fill = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
    fill.value = withTiming(1, { duration: FILL_DURATION });
    scale.value = withDelay(
      FILL_DURATION,
      withRepeat(withSequence(withTiming(1.06, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true),
    );

    const timer = setTimeout(() => router.replace('/login'), TOTAL_DURATION);
    return () => clearTimeout(timer);
  }, [fill, opacity, scale, router]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fill.value, [0, 1], ['#FFFFFF', brand.colors.primary]),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    color: interpolateColor(fill.value, [0, 1], [brand.colors.primary, brand.colors.textOnPrimary]),
    transform: [{ scale: scale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * fill.value,
    color: interpolateColor(fill.value, [0, 1], [brand.colors.primary, brand.colors.textOnPrimary]),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <SafeAreaView style={styles.content}>
        <View style={styles.center}>
          <Animated.Text style={[styles.title, titleStyle]}>{brand.appLabel}</Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>{strings.common.loading}</Animated.Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
