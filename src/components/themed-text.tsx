import { StyleSheet, Text, type TextProps } from 'react-native';

import { useBrandColors } from '@/theme/ThemeProvider';
import { BrandColors } from '@/brands';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'link';
  color?: keyof BrandColors;
};

export function ThemedText({ style, type = 'default', color, ...rest }: ThemedTextProps) {
  const colors = useBrandColors();

  return (
    <Text
      style={[
        { color: colors[color ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'link' && [styles.link, { color: colors.accent }],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
});
