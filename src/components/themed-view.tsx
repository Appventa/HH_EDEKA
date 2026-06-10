import { View, type ViewProps } from 'react-native';

import { BrandColors } from '@/brands';
import { useBrandColors } from '@/theme/ThemeProvider';

export type ThemedViewProps = ViewProps & {
  color?: keyof BrandColors;
};

export function ThemedView({ style, color, ...otherProps }: ThemedViewProps) {
  const colors = useBrandColors();

  return <View style={[{ backgroundColor: colors[color ?? 'background'] }, style]} {...otherProps} />;
}
