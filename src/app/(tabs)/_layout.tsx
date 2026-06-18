import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { strings } from '@/constants/strings';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const brand = useBrand();
  const router = useRouter();
  const clearBrand = useBrandStore((state) => state.clearBrand);

  const handleSwitchBrand = () => {
    clearBrand();
    router.replace('/brand-picker');
  };

  const BackButton = () => (
    <Pressable
      onPress={() => router.navigate('/(tabs)/')}
      style={styles.headerLeft}
      hitSlop={8}
    >
      <Ionicons name="chevron-back" size={20} color={brand.colors.textSecondary} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: brand.colors.background },
        headerTitle: () => null,
        headerLeft: () => <BackButton />,
        headerRight: () => (
          <Pressable onPress={() => router.push('/profil')} style={styles.headerButton}>
            <Ionicons name="person-circle-outline" size={26} color={brand.colors.text} />
          </Pressable>
        ),
        tabBarActiveTintColor: brand.colors.accent,
        tabBarInactiveTintColor: brand.colors.textSecondary,
        tabBarStyle: { backgroundColor: brand.colors.background, borderTopColor: brand.colors.border },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.start,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          headerLeft: () => (
            <Pressable onPress={handleSwitchBrand} style={styles.headerLeft} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={brand.colors.textSecondary} />
              <BrandLogo
                brand={brand}
                style={brand.id === 'handelshof' ? styles.headerLogoHH : styles.headerLogo}
              />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="karte"
        options={{
          title: strings.tabs.karte,
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="scanner" options={{ href: null }} />
      <Tabs.Screen
        name="inventar"
        options={{
          title: strings.tabs.inventar,
          tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="produkte"
        options={{
          title: strings.tabs.produkte,
          tabBarIcon: ({ color, size }) => <Ionicons name="pricetags-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="liste"
        options={{
          title: strings.tabs.liste,
          tabBarLabel: 'Einkaufsliste',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="kasse"
        options={{
          title: strings.tabs.kasse,
          tabBarLabel: 'Warenkorb',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="maerkte" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 12,
  },
  headerLogo: {
    width: 120,
    height: 32,
  },
  // HH logo is 1037×608 (ratio ~1.71) → at height 32 = 55px wide.
  // Exact proportional box → zero centering offset, logo sits flush after the chevron.
  headerLogoHH: {
    width: 55,
    height: 32,
  },
});
