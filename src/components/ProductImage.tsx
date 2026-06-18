import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/constants/categoryIcons';
import { PRODUCT_IMAGES } from '@/constants/productImages';

export function ProductImage({
  imageId,
  category,
  size,
  iconColor,
  backgroundColor,
  style,
}: {
  imageId?: string;
  category: string;
  size: number;
  iconColor: string;
  backgroundColor: string;
  style?: ViewStyle;
}) {
  const source = imageId ? PRODUCT_IMAGES[imageId] : undefined;
  const icon = CATEGORY_ICONS[category] ?? DEFAULT_CATEGORY_ICON;

  return (
    <View style={[styles.wrap, { width: size, height: size, backgroundColor }, style]}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <Ionicons name={icon} size={size * 0.5} color={iconColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
