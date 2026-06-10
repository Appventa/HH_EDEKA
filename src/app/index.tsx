import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';

const SPLASH_DURATION = 1400;

export default function SplashScreen() {
  const router = useRouter();
  const brandId = useBrandStore((state) => state.brandId);
  const brandHydrated = useBrandStore((state) => state.hasHydrated);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const authHydrated = useAuthStore((state) => state.hasHydrated);

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(withTiming(1.05, { duration: 500 }), withTiming(1, { duration: 200 }));
    opacity.value = withTiming(1, { duration: 500 });
  }, [opacity, scale]);

  useEffect(() => {
    if (!brandHydrated || !authHydrated) return;

    const timer = setTimeout(() => {
      if (!brandId) {
        router.replace('/brand-picker');
      } else if (!isLoggedIn) {
        router.replace('/login');
      } else {
        router.replace('/(tabs)');
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [brandHydrated, authHydrated, brandId, isLoggedIn, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <ThemedText style={styles.title}>ONE</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD500',
  },
  title: {
    fontSize: 64,
    fontWeight: '800',
    color: '#003B7C',
    letterSpacing: 4,
  },
});
