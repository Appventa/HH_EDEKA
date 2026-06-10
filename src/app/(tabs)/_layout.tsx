import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { strings } from '@/constants/strings';
import { useBrand } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const brand = useBrand();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: brand.colors.background },
        headerTitleStyle: { color: brand.colors.text },
        headerRight: () => (
          <Pressable onPress={() => router.push('/profil')} style={styles.headerButton}>
            <Ionicons name="person-circle-outline" size={26} color={brand.colors.text} />
          </Pressable>
        ),
        tabBarActiveTintColor: brand.colors.accent,
        tabBarInactiveTintColor: brand.colors.textSecondary,
        tabBarStyle: { backgroundColor: brand.colors.background, borderTopColor: brand.colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.start,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="karte"
        options={{
          title: strings.tabs.karte,
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size + 8} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="angebote"
        options={{
          title: strings.tabs.angebote,
          tabBarIcon: ({ color, size }) => <Ionicons name="pricetags-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="liste"
        options={{
          title: strings.tabs.liste,
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="maerkte"
        options={{
          title: strings.tabs.maerkte,
          tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
});
