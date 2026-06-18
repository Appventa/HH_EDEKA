import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/themed-text';
import { brandList, BrandConfig } from '@/brands';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useBrandStore } from '@/state/useBrandStore';

export default function BrandPickerScreen() {
  const router = useRouter();
  const setBrand = useBrandStore((state) => state.setBrand);

  const handleSelect = (brand: BrandConfig) => {
    setBrand(brand.id);
    router.replace('/brand-loading');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title} color="text">
          {strings.brandPicker.title}
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle} color="textSecondary">
          {strings.brandPicker.subtitle}
        </ThemedText>
      </View>

      <View style={styles.cards}>
        {brandList.map((brand, index) => (
          <MotiView
            key={brand.id}
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: index * 120 }}
            style={styles.cardWrapper}
          >
            <Pressable
              onPress={() => handleSelect(brand)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: brand.colors.surface, borderColor: brand.colors.border },
                pressed && styles.cardPressed,
              ]}
            >
              <BrandLogo brand={brand} />
            </Pressable>
          </MotiView>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
  },
  header: {
    marginTop: Spacing.six,
    marginBottom: Spacing.five,
    gap: Spacing.two,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  cards: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  cardWrapper: {
    aspectRatio: 2.4,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.8,
  },
});
