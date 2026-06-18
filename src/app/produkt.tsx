import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationBar } from '@/components/LocationBar';
import { ProductImage } from '@/components/ProductImage';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getProductDetail } from '@/data/services/productDetails';
import { PackagingUnit, ProductDetail } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useBrand } from '@/theme/ThemeProvider';
import { BrandColors } from '@/brands';

type Colors = Pick<BrandColors, 'surface' | 'border' | 'accent' | 'textSecondary'>;

export default function ProduktScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const params = useLocalSearchParams<{
    imageId: string;
    title: string;
    price: string;
    unit: string;
    category: string;
  }>();

  const [detail, setDetail] = useState<ProductDetail | null | undefined>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    getProductDetail(brandId, params.imageId).then((data) => {
      if (!cancelled) setDetail(data ?? undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId, params.imageId]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <ThemedText type="subtitle">{params.title}</ThemedText>
            {detail ? (
              <>
                <ThemedText type="small" color="textSecondary">
                  {detail.manufacturer}
                </ThemedText>
                <ThemedText type="small" color="textSecondary">
                  {detail.brandLabel}
                </ThemedText>
              </>
            ) : null}
            <View style={styles.priceRow}>
              <ThemedText type="smallBold" color="accent">
                {Number(params.price).toFixed(2).replace('.', ',')} €
              </ThemedText>
              <ThemedText type="small" color="textSecondary">
                {params.unit}
              </ThemedText>
            </View>
          </View>
          <ProductImage
            imageId={params.imageId}
            category={params.category}
            size={110}
            iconColor={brand.colors.accent}
            backgroundColor={brand.colors.border}
            style={styles.headerImage}
          />
        </View>

        {detail === null ? (
          <View style={[styles.skeleton, { backgroundColor: brand.colors.surface }]} />
        ) : detail === undefined ? (
          <ThemedText type="small" color="textSecondary">
            {strings.produkt.notAvailable}
          </ThemedText>
        ) : (
          <ProductDetailContent detail={detail} colors={brand.colors} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductDetailContent({ detail, colors }: { detail: ProductDetail; colors: Colors }) {
  return (
    <>
      <Section title={strings.produkt.generalInfo} colors={colors}>
        <InfoRow label={strings.produkt.productGroup} value={detail.productGroup} colors={colors} />
        <InfoRow label={strings.produkt.productSubgroup} value={detail.productSubgroup} colors={colors} />
        <InfoRow label={strings.produkt.manufacturerGroup} value={detail.manufacturerGroup} colors={colors} />
        <InfoRow label={strings.produkt.sources} value={detail.sources} colors={colors} />
        <InfoRow label={strings.produkt.shelfLife} value={detail.shelfLife} colors={colors} last />
      </Section>

      <Section title={strings.produkt.generalNotes} colors={colors}>
        <InfoRow label={strings.produkt.storage} value={detail.storageInfo} colors={colors} last={!detail.preparation} />
        {detail.preparation ? (
          <InfoRow label={strings.produkt.preparation} value={detail.preparation} colors={colors} last />
        ) : null}
      </Section>

      <Section title={strings.produkt.labeling} colors={colors}>
        <InfoRow label={strings.produkt.customsTariffNumber} value={detail.customsTariffNumber} colors={colors} />
        <InfoRow
          label={strings.produkt.manufacturerLabel}
          value={`${detail.manufacturer}\n${detail.manufacturerAddress}`}
          colors={colors}
        />
        <InfoRow label={strings.produkt.dietaryInfo} value={detail.dietaryInfo} colors={colors} last />
      </Section>

      <Section title={strings.produkt.packagingUnits} colors={colors}>
        <ThemedText type="smallBold" style={styles.subsectionTitle}>
          {strings.produkt.salesUnit}
        </ThemedText>
        <PackagingUnitRows unit={detail.salesUnit} colors={colors} />

        <ThemedText type="smallBold" style={styles.subsectionTitle}>
          {strings.produkt.singleUnit}
        </ThemedText>
        <PackagingUnitRows unit={detail.singleUnit} colors={colors} last />
      </Section>
    </>
  );
}

function PackagingUnitRows({ unit, colors, last }: { unit: PackagingUnit; colors: Colors; last?: boolean }) {
  return (
    <>
      <InfoRow label={strings.produkt.type} value={unit.type} colors={colors} />
      <InfoRow label={strings.produkt.gtin} value={unit.gtin} colors={colors} />
      {unit.quantity ? (
        <InfoRow label={strings.produkt.quantityPerSalesUnit} value={String(unit.quantity)} colors={colors} />
      ) : null}
      <InfoRow label={strings.produkt.grossWeight} value={unit.grossWeight} colors={colors} />
      <InfoRow label={strings.produkt.netWeight} value={unit.netWeight} colors={colors} />
      <InfoRow label={strings.produkt.dimensions} value={unit.dimensions} colors={colors} last={last} />
    </>
  );
}

function Section({ title, colors, children }: { title: string; colors: Colors; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" color="accent" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value, colors, last }: { label: string; value: string; colors: Colors; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <ThemedText type="small" color="textSecondary" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.infoValue}>
        {value}
      </ThemedText>
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
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  headerImage: {
    borderRadius: 12,
  },
  skeleton: {
    height: 200,
    borderRadius: 16,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    textTransform: 'uppercase',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
  },
  subsectionTitle: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
});
