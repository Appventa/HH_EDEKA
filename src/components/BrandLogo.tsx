import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

import { BrandConfig } from '@/brands';

const WORDMARKS: Record<BrandConfig['id'], number> = {
  handelshof: require('@/assets/images/HH_logo.webp'),
  'edeka-foodservice': require('@/assets/images/Edeka_logo.webp'),
};

export function BrandLogo({ brand, style }: { brand: BrandConfig; style?: StyleProp<ImageStyle> }) {
  return <Image source={WORDMARKS[brand.id]} style={[styles.wordmark, style]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  wordmark: {
    width: '85%',
    height: '85%',
  },
});
