import { StyleSheet, View } from 'react-native';

import { useBrand } from '@/theme/ThemeProvider';

export function ScreenBackground() {
  const brand = useBrand();
  return <View style={[StyleSheet.absoluteFillObject, { backgroundColor: brand.colors.background }]} pointerEvents="none" />;
}
