import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const router = useRouter();
  const brand = useBrand();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const handleSubmit = () => {
    login(username || 'Restaurant Adler', stayLoggedIn);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: brand.colors.background }]}>
      <View style={styles.header}>
        <BrandLogo brand={brand} size="small" />
        <ThemedText type="title" style={styles.title}>
          {strings.login.title}
        </ThemedText>
        <ThemedText type="default" color="textSecondary">
          {strings.login.subtitle}
        </ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText type="smallBold" color="textSecondary">
            {strings.login.username}
          </ThemedText>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={[styles.input, { borderColor: brand.colors.border, color: brand.colors.text }]}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold" color="textSecondary">
            {strings.login.password}
          </ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { borderColor: brand.colors.border, color: brand.colors.text }]}
          />
        </View>

        <Pressable style={styles.checkboxRow} onPress={() => setStayLoggedIn((value) => !value)}>
          <View
            style={[
              styles.checkbox,
              { borderColor: brand.colors.accent },
              stayLoggedIn && { backgroundColor: brand.colors.accent },
            ]}
          />
          <ThemedText type="default">{strings.login.stayLoggedIn}</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: brand.colors.primary },
            pressed && styles.submitPressed,
          ]}
        >
          <ThemedText type="smallBold" style={{ color: brand.colors.textOnPrimary }}>
            {strings.login.submit}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" color="textSecondary" style={styles.hint}>
          {strings.login.demoHint}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    marginTop: Spacing.six,
    marginBottom: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontSize: 32,
  },
  form: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
  },
  submit: {
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitPressed: {
    opacity: 0.85,
  },
  hint: {
    textAlign: 'center',
  },
});
