import { StyleSheet, View } from 'react-native';

import { BrandConfig } from '@/brands';
import { ThemedText } from '@/components/themed-text';

/**
 * Text-based placeholder logo. Drop real logo files into
 * assets/brands/<brand-id>/ and swap this for an <Image> once available.
 */
export function BrandLogo({ brand, size = 'large' }: { brand: BrandConfig; size?: 'large' | 'small' }) {
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: brand.colors.primary,
          paddingHorizontal: isLarge ? 28 : 14,
          paddingVertical: isLarge ? 16 : 8,
          borderRadius: isLarge ? 20 : 12,
        },
      ]}
    >
      <ThemedText
        style={{ color: brand.colors.textOnPrimary, fontWeight: '800', fontSize: isLarge ? 28 : 16 }}
      >
        {brand.shortName}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
