import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityBadge } from '@/components/AvailabilityBadge';
import { LocationBar } from '@/components/LocationBar';
import { ScannerExplainerOverlay } from '@/components/ScannerExplainerOverlay';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/constants/categoryIcons';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { getProductByEAN } from '@/data/services/products';
import { Branch, Product } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { ScanMode, useCartStore } from '@/state/useCartStore';
import { useOnboardingStore } from '@/state/useOnboardingStore';
import { useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrand } from '@/theme/ThemeProvider';

type ScanResult = { ean: string; product: Product | undefined };

export default function ScannerScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const addListItem = useShoppingListStore((state) => state.addItem);
  const addCartItem = useCartStore((state) => state.addItem);
  const mode = useCartStore((state) => state.mode[brandId]);
  const cartItems = useCartStore((state) => state.items[brandId]);
  const explainerDismissed = useOnboardingStore((state) => state.scannerExplainerDismissed[brandId]);
  const dismissExplainer = useOnboardingStore((state) => state.dismissScannerExplainer);
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [added, setAdded] = useState(false);
  const [showExplainer, setShowExplainer] = useState(!explainerDismissed);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    let cancelled = false;
    getBranches(brandId).then((data) => {
      if (!cancelled) setBranches(data);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const handleScan = async ({ data }: { data: string }) => {
    if (result) return;
    const product = await getProductByEAN(brandId, data);
    setResult({ ean: data, product });
  };

  const handleAdd = (product: Product) => {
    const addable = {
      id: product.ean,
      title: product.name,
      unit: product.unit,
      price: product.price,
      imageId: product.imageId,
      category: product.category,
      availableBranchIds: product.availableBranchIds,
    };
    if (mode === 'instore') {
      addCartItem(brandId, addable);
    } else {
      addListItem(brandId, addable);
    }
    setAdded(true);
  };

  const handleRescan = () => {
    setResult(null);
    setAdded(false);
  };

  const handleDontShowExplainerAgain = () => {
    dismissExplainer(brandId);
    setShowExplainer(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenBackground />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['left', 'right']}>
        <ScreenBackground />
        <Ionicons name="camera-outline" size={48} color={brand.colors.textSecondary} />
        <ThemedText type="title" style={styles.permissionTitle}>
          {strings.scanner.permissionTitle}
        </ThemedText>
        <ThemedText type="small" color="textSecondary" style={styles.permissionHint}>
          {strings.scanner.permissionHint}
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={[styles.permissionButton, { backgroundColor: brand.colors.accent }]}
        >
          <ThemedText style={[styles.permissionButtonText, { color: brand.colors.textOnAccent }]}>
            {strings.scanner.permissionButton}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
        onBarcodeScanned={result ? undefined : handleScan}
      />

      <LocationBar />

      <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right']}>
        <ThemedText style={styles.overlayTitle}>{strings.scanner.title}</ThemedText>

        {!result && (
          <>
            <View style={styles.frame} />
            <ThemedText style={styles.overlayHint}>{strings.scanner.hint}</ThemedText>
          </>
        )}
      </SafeAreaView>

      {result && (
        <View style={[styles.resultCard, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          {result.product ? (
            <ProductResult
              product={result.product}
              colors={brand.colors}
              added={added}
              mode={mode}
              branchCount={branches.length}
              onAdd={() => handleAdd(result.product!)}
            />
          ) : (
            <View style={styles.notFound}>
              <Ionicons name="alert-circle-outline" size={32} color={brand.colors.textSecondary} />
              <ThemedText type="smallBold">{strings.scanner.notFoundTitle}</ThemedText>
              <ThemedText type="small" color="textSecondary">
                {strings.scanner.notFoundHint}
              </ThemedText>
            </View>
          )}

          <Pressable
            onPress={handleRescan}
            style={[styles.rescanButton, { borderColor: brand.colors.border }]}
          >
            <Ionicons name="scan-outline" size={18} color={brand.colors.accent} />
            <ThemedText style={[styles.rescanButtonText, { color: brand.colors.accent }]}>
              {strings.scanner.scanAgain}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {mode === 'instore' && !result && cartCount > 0 && (
        <Pressable
          onPress={() => router.push('/kasse')}
          style={[styles.cartBar, { backgroundColor: brand.colors.accent }]}
        >
          <Ionicons name="cart-outline" size={20} color={brand.colors.textOnAccent} />
          <ThemedText style={[styles.cartBarText, { color: brand.colors.textOnAccent }]}>
            {strings.scanner.cartSummary(cartCount, formatPrice(cartTotal))}
          </ThemedText>
          <Ionicons name="chevron-forward" size={18} color={brand.colors.textOnAccent} />
        </Pressable>
      )}

      {showExplainer && (
        <ScannerExplainerOverlay
          onStart={() => setShowExplainer(false)}
          onDontShowAgain={handleDontShowExplainerAgain}
        />
      )}
    </View>
  );
}

function ProductResult({
  product,
  colors,
  added,
  mode,
  branchCount,
  onAdd,
}: {
  product: Product;
  colors: { surface: string; border: string; accent: string; textOnAccent: string; success: string; error: string };
  added: boolean;
  mode: ScanMode;
  branchCount: number;
  onAdd: () => void;
}) {
  const icon = CATEGORY_ICONS[product.category] ?? DEFAULT_CATEGORY_ICON;
  const addLabel = mode === 'instore' ? strings.scanner.addToCart : strings.angebote.addToList;
  const addedLabel = mode === 'instore' ? strings.scanner.addedToCart : strings.angebote.added;

  return (
    <View style={styles.productCard}>
      <Pressable
        style={styles.productMain}
        onPress={() =>
          router.push({
            pathname: '/produkt',
            params: {
              imageId: product.imageId,
              title: product.name,
              price: String(product.price),
              unit: product.unit,
              category: product.category,
            },
          })
        }
      >
        <ThemedText type="smallBold" numberOfLines={1}>
          {product.name}
        </ThemedText>

        <View style={styles.productBodyRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.border }]}>
            <Ionicons name={icon} size={28} color={colors.accent} />
          </View>

          <View style={styles.productInfo}>
            {mode === 'planning' && (
              <AvailabilityBadge
                availableBranchIds={product.availableBranchIds}
                branchCount={branchCount}
                colors={colors}
              />
            )}
          </View>
        </View>
      </Pressable>

      <View style={styles.productFooter}>
        <View style={styles.priceRow}>
          <ThemedText type="subtitle" color="accent">
            {product.price.toFixed(2).replace('.', ',')} €
          </ThemedText>
          <ThemedText type="small" color="textSecondary">
            {product.unit}
          </ThemedText>
        </View>

        <Pressable
          onPress={onAdd}
          style={[styles.addButton, { backgroundColor: added ? colors.success : colors.accent }]}
        >
          <Ionicons name={added ? 'checkmark' : 'add'} size={18} color={colors.textOnAccent} />
          <ThemedText style={[styles.addButtonText, { color: colors.textOnAccent }]}>
            {added ? addedLabel : addLabel}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function formatPrice(value: number) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  permissionTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  permissionHint: {
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  frame: {
    width: 250,
    height: 150,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: Spacing.four,
  },
  overlayHint: {
    color: '#FFFFFF',
    marginTop: Spacing.three,
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.six,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  productCard: {
    gap: Spacing.two,
  },
  productMain: {
    gap: Spacing.two,
  },
  productBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: 2,
    minWidth: 64,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notFound: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderTopWidth: 1,
    paddingTop: Spacing.three,
  },
  rescanButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cartBar: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.six,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cartBarText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
});
