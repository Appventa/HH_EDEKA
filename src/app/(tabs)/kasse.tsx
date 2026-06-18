import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Barcode } from '@/components/Barcode';
import { BasketIllustration } from '@/components/BasketIllustration';
import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { getCustomerCard } from '@/data/services/customerCard';
import { resolvePurchaseLinks } from '@/data/services/inventory';
import { buildInvoice } from '@/data/services/invoices';
import { Branch, CustomerCard } from '@/data/types';
import { useBrandStore } from '@/state/useBrandStore';
import { useInventoryStore } from '@/state/useInventoryStore';
import { useInvoiceStore } from '@/state/useInvoiceStore';
import { useShoppingListStore } from '@/state/useShoppingListStore';
import { useBrand } from '@/theme/ThemeProvider';

export default function KasseScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const items = useShoppingListStore((state) => state.items[brandId]);
  const clear = useShoppingListStore((state) => state.clear);
  const addPurchase = useInventoryStore((state) => state.addPurchase);
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const [card, setCard] = useState<CustomerCard | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [bluetoothActive, setBluetoothActive] = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);
  const [paid, setPaid] = useState(false);

  useFocusEffect(useCallback(() => () => setPaid(false), []));

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCustomerCard(brandId), getBranches(brandId)]).then(([cardData, branchData]) => {
      if (!cancelled) {
        setCard(cardData);
        setBranches(branchData);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const handlePay = () => {
    const links = resolvePurchaseLinks(items.map((i) => ({ title: i.title, quantity: i.quantity })));
    if (links.length > 0) addPurchase(links);
    const branchId = branches[0]?.id;
    if (branchId) addInvoice(brandId, buildInvoice(items, branchId, brandId));
    setCodeVisible(false);
    clear(brandId);
    setPaid(true);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (paid) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenBackground />
        <LocationBar />
        <View style={styles.body}>
          <Ionicons name="checkmark-circle" size={64} color={brand.colors.success} />
          <ThemedText type="title" style={styles.centeredTitle}>
            {strings.kasse.successTitle}
          </ThemedText>
          <ThemedText type="small" color="textSecondary" style={styles.centeredHint}>
            {strings.kasse.successHint}
          </ThemedText>
          <Pressable
            onPress={() => router.push('/(tabs)/')}
            style={[styles.successButton, { backgroundColor: brand.colors.accent, borderColor: brand.colors.accent }]}
          >
            <ThemedText type="smallBold" style={[styles.actionButtonText, { color: brand.colors.textOnAccent }]}>
              {strings.kasse.done}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenBackground />
        <LocationBar />
        <View style={styles.body}>
          <BasketIllustration color={brand.colors.accent} />
          <ThemedText type="title" style={styles.centeredTitle}>
            {strings.listeKasse.empty}
          </ThemedText>
          <ThemedText type="small" color="textSecondary" style={styles.centeredHint}>
            {strings.listeKasse.emptyHint}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" color="textSecondary" style={styles.subtitle}>
          {strings.listeKasse.subtitle}
        </ThemedText>

        <View style={[styles.card, { backgroundColor: brand.colors.surface, borderColor: brand.colors.border }]}>
          <ThemedText type="smallBold">{strings.listeKasse.itemsTitle}</ThemedText>
          {items.map((item) => (
            <View key={item.offerId} style={styles.itemRow}>
              <ThemedText type="small" style={styles.itemTitle}>
                {item.quantity}x {item.title}
              </ThemedText>
              <ThemedText type="small" color="textSecondary">
                {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
              </ThemedText>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: brand.colors.border }]}>
            <ThemedText type="subtitle">{strings.listeKasse.total}</ThemedText>
            <ThemedText type="subtitle" color="accent">
              {total.toFixed(2).replace('.', ',')} €
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: brand.colors.border, backgroundColor: brand.colors.background }]}>
        <Pressable
          onPress={() => setBluetoothActive(true)}
          style={[
            styles.actionButton,
            {
              backgroundColor: bluetoothActive ? brand.colors.success : brand.colors.surface,
              borderColor: bluetoothActive ? brand.colors.success : brand.colors.border,
            },
          ]}
        >
          <Ionicons
            name={bluetoothActive ? 'checkmark' : 'bluetooth-outline'}
            size={20}
            color={bluetoothActive ? brand.colors.textOnAccent : brand.colors.accent}
          />
          <ThemedText
            type="smallBold"
            style={[styles.actionButtonText, bluetoothActive && { color: brand.colors.textOnAccent }]}
          >
            {bluetoothActive ? strings.listeKasse.bluetoothActive : strings.listeKasse.activateBluetooth}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setCodeVisible(true)}
          style={[styles.actionButton, { backgroundColor: brand.colors.accent, borderColor: brand.colors.accent }]}
        >
          <Ionicons name="barcode-outline" size={20} color={brand.colors.textOnAccent} />
          <ThemedText type="smallBold" style={[styles.actionButtonText, { color: brand.colors.textOnAccent }]}>
            {strings.listeKasse.showCardCode}
          </ThemedText>
        </Pressable>
      </View>

      <CardCodeModal
        visible={codeVisible}
        onClose={() => setCodeVisible(false)}
        card={card}
        onPay={handlePay}
        successColor={brand.colors.success}
        textOnAccent={brand.colors.textOnAccent}
      />
    </SafeAreaView>
  );
}

function CardCodeModal({
  visible,
  onClose,
  card,
  onPay,
  successColor,
  textOnAccent,
}: {
  visible: boolean;
  onClose: () => void;
  card: CustomerCard | null;
  onPay: () => void;
  successColor: string;
  textOnAccent: string;
}) {
  const { width } = useWindowDimensions();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.zoomContainer}>
        <Pressable onPress={onClose} style={styles.zoomClose} hitSlop={12}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </Pressable>

        <View style={styles.zoomContent}>
          <ThemedText style={styles.zoomTitle}>{strings.listeKasse.cardCodeTitle}</ThemedText>

          <View style={styles.zoomBarcodeWrap}>
            <Barcode value={card?.customerNumber ?? '0000000000'} height={120} targetWidth={width - Spacing.four * 2} />
          </View>

          <ThemedText style={styles.zoomNumber}>{card?.customerNumber ?? '—'}</ThemedText>
          <ThemedText type="small" style={styles.zoomHint}>
            {strings.listeKasse.cardCodeHint}
          </ThemedText>

          <View style={styles.zoomDivider} />

          <Pressable onPress={onPay} style={[styles.zoomPayButton, { backgroundColor: successColor }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={textOnAccent} />
            <ThemedText style={[styles.zoomPayButtonText, { color: textOnAccent }]}>
              {strings.kasse.payButton}
            </ThemedText>
          </Pressable>

          <ThemedText type="small" style={styles.zoomPayHint}>
            {strings.listeKasse.paySimulateHint}
          </ThemedText>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  centeredTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  centeredHint: {
    textAlign: 'center',
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  itemTitle: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: Spacing.one,
    paddingTop: Spacing.two,
  },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: Spacing.three,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    marginTop: Spacing.two,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
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
  zoomTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: Spacing.three,
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
    textAlign: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: Spacing.three,
  },
  zoomPayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    width: '100%',
  },
  zoomPayButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  zoomPayHint: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 11,
  },
});
