import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/brands';
import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useBrandStore } from '@/state/useBrandStore';
import { MAX_TEAM_AUTHORIZATIONS, TeamAuthorization, useTeamStore } from '@/state/useTeamStore';
import { useBrand } from '@/theme/ThemeProvider';

const DEFAULT_START_OFFSET = 0;
const DEFAULT_DURATION = 3;
const MAX_START_OFFSET = 14;
const MAX_DURATION = 30;

type AuthStatus = 'pending' | 'active' | 'expired';

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateDE(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

function getStatus(auth: TeamAuthorization, todayISO: string): AuthStatus {
  if (todayISO < auth.startDate) return 'pending';
  if (todayISO > auth.endDate) return 'expired';
  return 'active';
}

export default function TeamScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const authorizations = useTeamStore((state) => state.authorizations[brandId]);
  const addAuthorization = useTeamStore((state) => state.addAuthorization);
  const removeAuthorization = useTeamStore((state) => state.removeAuthorization);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [startOffset, setStartOffset] = useState(DEFAULT_START_OFFSET);
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const todayISO = toISODate(new Date());
  const startDate = addDays(new Date(), startOffset);
  const endDate = addDays(startDate, duration);

  const canAdd = authorizations.length < MAX_TEAM_AUTHORIZATIONS;
  const canSubmit = name.trim().length > 0 && email.includes('@');

  const handleSubmit = () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();
    addAuthorization(brandId, {
      name: name.trim(),
      email: trimmedEmail,
      startDate: toISODate(startDate),
      endDate: toISODate(endDate),
    });
    setName('');
    setEmail('');
    setStartOffset(DEFAULT_START_OFFSET);
    setDuration(DEFAULT_DURATION);
    setShowForm(false);
    Alert.alert(strings.team.invitedTitle, strings.team.invitedHint(trimmedEmail));
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" color="textSecondary" style={styles.subtitle}>
          {strings.team.subtitle}
        </ThemedText>

        {canAdd ? (
          <Pressable
            onPress={() => setShowForm((value) => !value)}
            style={[styles.toggleButton, { backgroundColor: brand.colors.accent, borderColor: brand.colors.accent }]}
          >
            <Ionicons name={showForm ? 'close' : 'person-add-outline'} size={20} color={brand.colors.textOnAccent} />
            <ThemedText type="smallBold" style={{ color: brand.colors.textOnAccent }}>
              {showForm ? strings.team.cancel : strings.team.addButton}
            </ThemedText>
          </Pressable>
        ) : (
          <View style={[styles.limitNotice, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={brand.colors.textSecondary} />
            <ThemedText type="small" color="textSecondary">
              {strings.team.limitReached(MAX_TEAM_AUTHORIZATIONS)}
            </ThemedText>
          </View>
        )}

        {showForm && (
          <View style={[styles.formCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
            <View style={styles.field}>
              <ThemedText type="smallBold" color="textSecondary">
                {strings.team.nameLabel}
              </ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={strings.team.namePlaceholder}
                placeholderTextColor={brand.colors.textSecondary}
                style={[
                  styles.input,
                  { borderColor: brand.colors.border, color: brand.colors.text, backgroundColor: brand.colors.background },
                ]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="smallBold" color="textSecondary">
                {strings.team.emailLabel}
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={strings.team.emailPlaceholder}
                placeholderTextColor={brand.colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  { borderColor: brand.colors.border, color: brand.colors.text, backgroundColor: brand.colors.background },
                ]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="smallBold" color="textSecondary">
                {strings.team.validityLabel}
              </ThemedText>
              <View style={styles.stepperGroup}>
                <View style={styles.stepperItem}>
                  <ThemedText type="small" color="textSecondary">
                    {strings.team.startsIn}
                  </ThemedText>
                  <Stepper
                    value={startOffset}
                    min={0}
                    max={MAX_START_OFFSET}
                    label={strings.team.startsInValue(startOffset)}
                    onChange={setStartOffset}
                    colors={brand.colors}
                  />
                </View>
                <View style={styles.stepperItem}>
                  <ThemedText type="small" color="textSecondary">
                    {strings.team.duration}
                  </ThemedText>
                  <Stepper
                    value={duration}
                    min={1}
                    max={MAX_DURATION}
                    label={strings.team.durationValue(duration)}
                    onChange={setDuration}
                    colors={brand.colors}
                  />
                </View>
              </View>
              <ThemedText type="small" color="accent" style={styles.validRange}>
                {strings.team.validRange(formatDateDE(toISODate(startDate)), formatDateDE(toISODate(endDate)))}
              </ThemedText>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.submitButton, { backgroundColor: brand.colors.accent, opacity: canSubmit ? 1 : 0.5 }]}
            >
              <ThemedText type="smallBold" style={{ color: brand.colors.textOnAccent }}>
                {strings.team.submit}
              </ThemedText>
            </Pressable>
          </View>
        )}

        {authorizations.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={brand.colors.accent} />
            <ThemedText type="default" style={styles.emptyTitle}>
              {strings.team.empty}
            </ThemedText>
            <ThemedText type="small" color="textSecondary" style={styles.emptyHint}>
              {strings.team.emptyHint}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {authorizations.map((auth) => (
              <TeamMemberCard
                key={auth.id}
                auth={auth}
                status={getStatus(auth, todayISO)}
                colors={brand.colors}
                onRevoke={() => removeAuthorization(brandId, auth.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stepper({
  value,
  min,
  max,
  label,
  onChange,
  colors,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  colors: Pick<BrandColors, 'border' | 'text'>;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.stepperButton, { borderColor: colors.border }]}
        hitSlop={8}
      >
        <Ionicons name="remove" size={16} color={colors.text} />
      </Pressable>
      <ThemedText type="smallBold" style={styles.stepperValue}>
        {label}
      </ThemedText>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.stepperButton, { borderColor: colors.border }]}
        hitSlop={8}
      >
        <Ionicons name="add" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

function TeamMemberCard({
  auth,
  status,
  colors,
  onRevoke,
}: {
  auth: TeamAuthorization;
  status: AuthStatus;
  colors: BrandColors;
  onRevoke: () => void;
}) {
  const statusLabel =
    status === 'active'
      ? strings.team.statusActive
      : status === 'pending'
        ? strings.team.statusPending
        : strings.team.statusExpired;
  const statusColorKey: keyof BrandColors = status === 'expired' ? 'textSecondary' : status === 'pending' ? 'accent' : 'success';

  return (
    <View style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.memberHeader}>
        <View style={styles.memberInfo}>
          <ThemedText type="smallBold">{auth.name}</ThemedText>
          <ThemedText type="small" color="textSecondary">
            {auth.email}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.background, borderColor: colors[statusColorKey] }]}>
          <ThemedText type="small" color={statusColorKey} style={styles.statusBadgeText}>
            {statusLabel}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" color="textSecondary">
        {formatDateDE(auth.startDate)} – {formatDateDE(auth.endDate)}
      </ThemedText>

      <Pressable onPress={onRevoke} style={styles.revokeButton} hitSlop={8}>
        <Ionicons name="trash-outline" size={16} color={colors.error} />
        <ThemedText type="small" color="error">
          {strings.team.revoke}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  subtitle: {
    marginBottom: Spacing.one,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.three,
  },
  limitNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.two,
    fontSize: 16,
  },
  stepperGroup: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stepperItem: {
    flex: 1,
    gap: Spacing.one,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
  },
  validRange: {
    marginTop: Spacing.one,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  memberCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
  },
  statusBadgeText: {
    fontWeight: '700',
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
});
