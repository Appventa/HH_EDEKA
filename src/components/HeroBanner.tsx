import { ImageBackground, StyleSheet } from 'react-native';

import { BrandConfig } from '@/brands';

const HERO_IMAGES: Record<BrandConfig['id'], number> = {
  'edeka-foodservice': require('@/assets/images/edeka_hero.jpg'),
  handelshof: require('@/assets/images/HH_Hero.jpg'),
};

export function HeroBanner({ brand }: { brand: BrandConfig }) {
  return <ImageBackground source={HERO_IMAGES[brand.id]} style={styles.banner} imageStyle={styles.image} />;
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    aspectRatio: 1.95,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});
