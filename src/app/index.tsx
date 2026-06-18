import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';

const SPLASH_DURATION = 1400;

export default function SplashScreen() {
  const router = useRouter();
  const brandId = useBrandStore((state) => state.brandId);
  const brandHydrated = useBrandStore((state) => state.hasHydrated);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const authHydrated = useAuthStore((state) => state.hasHydrated);

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, [opacity]);

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

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, imageStyle]}>
      <Image source={require('@/assets/images/splash-brands.webp')} style={styles.image} resizeMode="cover" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
