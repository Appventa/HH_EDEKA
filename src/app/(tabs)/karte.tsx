import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Barcode } from '@/components/Barcode';
import { BrandLogo } from '@/components/BrandLogo';
import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getCustomerCard } from '@/data/services/customerCard';
import { CustomerCard } from '@/data/types';
import { BrandConfig } from '@/brands';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function KarteScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const [card, setCard] = useState<CustomerCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const flip = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    getCustomerCard(brandId).then((data) => {
      if (!cancelled) setCard(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    flip.value = withTiming(next ? 180 : 0, { duration: 450 });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }],
    opacity: flip.value > 90 ? 0 : 1,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value - 180}deg` }],
    opacity: flip.value > 90 ? 1 : 0,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <View style={styles.body}>
        <ThemedText type="title" style={styles.title}>
          {strings.karte.title}
        </ThemedText>

        <Pressable onPress={handleFlip} style={styles.cardWrapper}>
          <Animated.View style={[styles.card, frontStyle]}>
            {brand.id === 'edeka-foodservice' ? (
              <EdekaCardFront card={card} brand={brand} />
            ) : (
              <HandelshofCardFront card={card} brand={brand} />
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { backgroundColor: brand.colors.surface, borderColor: brand.colors.border },
              backStyle,
            ]}
          >
            <CardBack card={card} />
          </Animated.View>
        </Pressable>

        <ThemedText type="small" color="textSecondary" style={styles.hint}>
          {strings.karte.flipHint}
        </ThemedText>

        <Pressable
          onPress={() => setZoomVisible(true)}
          style={({ pressed }) => [
            styles.zoomButton,
            { backgroundColor: brand.colors.accent },
            pressed && styles.zoomButtonPressed,
          ]}
        >
          <Ionicons name="barcode-outline" size={22} color={brand.colors.textOnAccent} />
          <ThemedText style={[styles.zoomButtonText, { color: brand.colors.textOnAccent }]}>
            {strings.karte.zoom}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" color="textSecondary" style={styles.backNote}>
          {strings.karte.backNote}
        </ThemedText>
      </View>

      <BarcodeZoomModal visible={zoomVisible} onClose={() => setZoomVisible(false)} card={card} brand={brand} />
    </SafeAreaView>
  );
}

function BarcodeZoomModal({
  visible,
  onClose,
  card,
  brand,
}: {
  visible: boolean;
  onClose: () => void;
  card: CustomerCard | null;
  brand: BrandConfig;
}) {
  const { width } = useWindowDimensions();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.zoomContainer}>
        <Pressable onPress={onClose} style={styles.zoomClose} hitSlop={12}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </Pressable>

        <View style={styles.zoomContent}>
          <ThemedText style={styles.zoomBrand}>{brand.shortName}</ThemedText>
          <ThemedText style={styles.zoomName}>{card?.holderName ?? '—'}</ThemedText>

          <View style={styles.zoomBarcodeWrap}>
            <Barcode value={card?.customerNumber ?? '0000000000'} height={120} targetWidth={width - Spacing.five * 2} />
          </View>

          <ThemedText style={styles.zoomNumber}>{card?.customerNumber ?? '—'}</ThemedText>
          <ThemedText type="small" style={styles.zoomHint}>
            {strings.karte.zoomHint}
          </ThemedText>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function EdekaCardFront({ card, brand }: { card: CustomerCard | null; brand: BrandConfig }) {
  return (
    <View style={[styles.cardInner, { backgroundColor: '#ECEDEF', borderColor: '#D5D8DC' }]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.logoColumn}>
          <BrandLogo brand={brand} style={styles.cardLogo} />
          <ThemedText style={styles.tagline}>{strings.karte.edeka.tagline}</ThemedText>
        </View>
        <ThemedText style={styles.cardLabel}>{strings.karte.edeka.cardLabel}</ThemedText>
      </View>

      <View style={styles.cardBody}>
        <ThemedText style={styles.holderName}>{card?.holderName ?? '—'}</ThemedText>
        <ThemedText style={styles.role}>{strings.karte.edeka.role}</ThemedText>
        <ThemedText style={styles.businessName}>{card?.businessName ?? '—'}</ThemedText>
      </View>

      <View style={styles.cardFooterRow}>
        <View>
          <ThemedText style={styles.footerLabel}>{strings.karte.customerNumber}</ThemedText>
          <ThemedText style={styles.footerValue}>{card?.customerNumber ?? '—'}</ThemedText>
        </View>
        <Barcode value={card?.customerNumber ?? '0000000000'} height={40} barWidth={1.4} />
      </View>
    </View>
  );
}

function HandelshofCardFront({ card, brand }: { card: CustomerCard | null; brand: BrandConfig }) {
  return (
    <View style={[styles.cardInner, { backgroundColor: '#FFFFFF', borderColor: brand.colors.border }]}>
      <View style={styles.cardHeaderRow}>
        <BrandLogo brand={brand} style={styles.cardLogo} />
        <View style={styles.titleBlock}>
          <ThemedText style={styles.cardLabelDark}>{strings.karte.handelshof.cardLabel}</ThemedText>
          <View style={styles.underline} />
        </View>
      </View>

      <View style={styles.handelshofBodyRow}>
        <View style={[styles.photoPlaceholder, { borderColor: brand.colors.border }]}>
          <Image source={require('@/assets/images/person.jpg')} style={styles.photoImage} />
        </View>
        <View style={styles.nameBlock}>
          <ThemedText style={styles.holderNameDark}>{formatHolderName(card?.holderName)}</ThemedText>
          <ThemedText style={[styles.role, { color: brand.colors.textSecondary }]}>
            {strings.karte.handelshof.role}
          </ThemedText>
          <ThemedText style={styles.businessName}>{card?.businessName ?? '—'}</ThemedText>
        </View>
      </View>

      <View style={styles.cardFooterRow}>
        <ThemedText type="small" color="textSecondary" style={styles.address} numberOfLines={2}>
          {strings.karte.handelshof.address}
        </ThemedText>
        <Barcode value={card?.customerNumber ?? '0000000000'} height={40} barWidth={1.4} />
      </View>
    </View>
  );
}

function CardBack({ card }: { card: CustomerCard | null }) {
  return (
    <View style={styles.backContent}>
      <ThemedText type="subtitle">{strings.karte.backTitle}</ThemedText>

      <View style={styles.backRow}>
        <ThemedText type="small" color="textSecondary">
          {strings.karte.customerNumber}
        </ThemedText>
        <ThemedText type="smallBold">{card?.customerNumber ?? '—'}</ThemedText>
      </View>

      <View style={styles.backRow}>
        <ThemedText type="small" color="textSecondary">
          {strings.karte.business}
        </ThemedText>
        <ThemedText type="smallBold">{card?.businessName ?? '—'}</ThemedText>
      </View>

      <View style={styles.backRow}>
        <ThemedText type="small" color="textSecondary">
          {strings.karte.validUntil}
        </ThemedText>
        <ThemedText type="smallBold">{card ? formatDate(card.validUntil) : '—'}</ThemedText>
      </View>
    </View>
  );
}

function formatHolderName(name?: string) {
  if (!name) return '—';
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name.toUpperCase();
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');
  return `${last.toUpperCase()}, ${first.toUpperCase()}`;
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    alignSelf: 'flex-start',
    marginBottom: Spacing.four,
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 1.586,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardBack: {
    padding: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.two,
  },
  cardInner: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoColumn: {
    gap: 2,
  },
  cardLogo: {
    width: 120,
    height: 32,
  },
  tagline: {
    fontSize: 11,
    color: '#7A828E',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A828E',
    letterSpacing: 0.5,
  },
  cardLabelDark: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 2,
  },
  holderName: {
    fontSize: 18,
    fontWeight: '700',
  },
  holderNameDark: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  role: {
    fontSize: 12,
  },
  businessName: {
    fontSize: 13,
    marginTop: 2,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 10,
    color: '#7A828E',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  titleBlock: {
    alignItems: 'flex-end',
  },
  underline: {
    marginTop: 4,
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  handelshofBodyRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  address: {
    flex: 1,
    fontSize: 10,
    marginRight: Spacing.two,
  },
  hint: {
    marginTop: Spacing.three,
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    width: '100%',
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  zoomButtonPressed: {
    opacity: 0.85,
  },
  zoomButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  backContent: {
    flex: 1,
    gap: Spacing.three,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backNote: {
    width: '100%',
    marginTop: Spacing.three,
    textAlign: 'center',
  },
  zoomContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  zoomClose: {
    alignSelf: 'flex-end',
    padding: Spacing.three,
  },
  zoomContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  zoomBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A828E',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  zoomName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: Spacing.four,
  },
  zoomBarcodeWrap: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
  },
  zoomNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 2,
    marginTop: Spacing.two,
  },
  zoomHint: {
    color: '#7A828E',
    marginTop: Spacing.two,
  },
});
