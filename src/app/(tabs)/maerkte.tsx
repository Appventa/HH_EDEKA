import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors, BrandConfig } from '@/brands';
import { LocationBar } from '@/components/LocationBar';
import { PinDropIllustration } from '@/components/PinDropIllustration';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { Branch } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';
import { getTodayHours, haversineKm } from '@/utils/geo';

interface BranchWithDistance extends Branch {
  distanceKm?: number;
}

export default function MaerkteScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const [branches, setBranches] = useState<BranchWithDistance[] | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await getBranches(brandId);
      let withDistance: BranchWithDistance[] = data;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          withDistance = [...data]
            .map((branch) => ({
              ...branch,
              distanceKm: haversineKm(position.coords.latitude, position.coords.longitude, branch.lat, branch.lng),
            }))
            .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
          if (!cancelled) setHasLocation(true);
        }
      } catch {
        // location unavailable — keep default order, no distances
      }

      if (!cancelled) setBranches(withDistance);
    })();

    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const nearest = hasLocation ? branches?.[0] : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {strings.maerkte.title}
        </ThemedText>

        {branches === null ? (
          <View style={[styles.skeleton, { backgroundColor: brand.colors.surface }]}>
            <PinDropIllustration color={brand.colors.accent} />
          </View>
        ) : (
          <>
            {nearest ? (
              <NearestBranchCard branch={nearest} brand={brand} />
            ) : (
              <ThemedText type="small" color="textSecondary" style={styles.locationHint}>
                {strings.maerkte.locationHint}
              </ThemedText>
            )}

            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {strings.maerkte.allBranches}
            </ThemedText>

            <View style={styles.list}>
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  colors={brand.colors}
                  expanded={expandedId === branch.id}
                  onToggle={() => setExpandedId((current) => (current === branch.id ? null : branch.id))}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NearestBranchCard({ branch, brand }: { branch: BranchWithDistance; brand: BrandConfig }) {
  return (
    <View style={[styles.nearestCard, { backgroundColor: brand.colors.accent }]}>
      <ThemedText style={[styles.nearestLabel, { color: brand.colors.textOnAccent }]}>
        {strings.maerkte.nearestBranch}
      </ThemedText>
      <ThemedText style={[styles.nearestName, { color: brand.colors.textOnAccent }]}>{branch.name}</ThemedText>
      <ThemedText style={[styles.nearestAddress, { color: brand.colors.textOnAccent }]}>
        {branch.street}, {branch.zip} {branch.city}
      </ThemedText>
      {branch.distanceKm !== undefined && (
        <ThemedText style={[styles.nearestDistance, { color: brand.colors.textOnAccent }]}>
          {strings.maerkte.distanceAway(branch.distanceKm.toFixed(1))}
        </ThemedText>
      )}
      <View style={styles.actionsRow}>
        <ActionButton
          icon="call-outline"
          label={strings.maerkte.call}
          color={brand.colors.textOnAccent}
          onPress={() => callBranch(branch)}
        />
        <ActionButton
          icon="navigate-outline"
          label={strings.maerkte.route}
          color={brand.colors.textOnAccent}
          onPress={() => routeToBranch(branch)}
        />
      </View>
    </View>
  );
}

function BranchCard({
  branch,
  colors,
  expanded,
  onToggle,
}: {
  branch: BranchWithDistance;
  colors: BrandColors;
  expanded: boolean;
  onToggle: () => void;
}) {
  const todayDay = todayHoursDay(branch.hours);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.branchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.branchHeaderRow}>
        <View style={styles.branchInfo}>
          <ThemedText type="smallBold">{branch.name}</ThemedText>
          <ThemedText type="small" color="textSecondary">
            {branch.street}, {branch.zip} {branch.city}
          </ThemedText>
          {branch.distanceKm !== undefined && (
            <ThemedText type="small" color="accent">
              {strings.maerkte.distanceAway(branch.distanceKm.toFixed(1))}
            </ThemedText>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </View>

      {expanded && (
        <View style={[styles.branchDetails, { borderTopColor: colors.border }]}>
          <ThemedText type="smallBold" style={styles.detailsTitle}>
            {strings.maerkte.hours}
          </ThemedText>
          {branch.hours.map((entry) => (
            <View key={entry.day} style={styles.hoursRow}>
              <ThemedText type="small" color={entry.day === todayDay ? 'accent' : 'textSecondary'}>
                {entry.day}
              </ThemedText>
              <ThemedText type="small" color={entry.day === todayDay ? 'accent' : 'textSecondary'}>
                {entry.time}
                {entry.day === todayDay ? ` · ${strings.maerkte.today}` : ''}
              </ThemedText>
            </View>
          ))}

          <View style={styles.actionsRow}>
            <ActionButton
              icon="call-outline"
              label={strings.maerkte.call}
              color={colors.accent}
              onPress={() => callBranch(branch)}
            />
            <ActionButton
              icon="navigate-outline"
              label={strings.maerkte.route}
              color={colors.accent}
              onPress={() => routeToBranch(branch)}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionButton} hitSlop={8}>
      <Ionicons name={icon} size={18} color={color} />
      <ThemedText style={[styles.actionLabel, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

function todayHoursDay(hours: { day: string; time: string }[]): string | undefined {
  const today = getTodayHours(hours);
  return hours.find((entry) => entry.time === today)?.day;
}

function callBranch(branch: Branch) {
  Linking.openURL(`tel:${branch.phone.replace(/\s+/g, '')}`);
}

function routeToBranch(branch: Branch) {
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`);
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
  title: {
    fontSize: 26,
  },
  skeleton: {
    height: 160,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationHint: {
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: Spacing.two,
  },
  nearestCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: 4,
  },
  nearestLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  nearestName: {
    fontSize: 20,
    fontWeight: '800',
  },
  nearestAddress: {
    fontSize: 14,
  },
  nearestDistance: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  list: {
    gap: Spacing.two,
  },
  branchCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
  },
  branchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  branchInfo: {
    flex: 1,
    gap: 2,
  },
  branchDetails: {
    borderTopWidth: 1,
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  detailsTitle: {
    marginBottom: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.three,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
