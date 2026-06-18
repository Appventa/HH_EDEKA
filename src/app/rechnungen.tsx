import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationBar } from '@/components/LocationBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ThemedText } from '@/components/themed-text';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getBranches } from '@/data/services/branches';
import { getInvoices } from '@/data/services/invoices';
import { Branch, Invoice } from '@/data/types';
import { useAuthStore } from '@/state/useAuthStore';
import { useBrandStore } from '@/state/useBrandStore';
import { useInvoiceStore } from '@/state/useInvoiceStore';
import { useBrand } from '@/theme/ThemeProvider';
import { formatDate, formatEUR, shareInvoicePdf } from '@/utils/invoicePdf';

export default function RechnungenScreen() {
  const brand = useBrand();
  const brandId = useBrandStore((state) => state.brandId) ?? brand.id;
  const businessName = useAuthStore((state) => state.businessName) ?? '';

  const dynamicInvoices = useInvoiceStore((state) => state.dynamicInvoices[brandId] ?? []);
  const [staticInvoices, setStaticInvoices] = useState<Invoice[] | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getInvoices(brandId), getBranches(brandId)]).then(([invoiceData, branchData]) => {
      if (!cancelled) {
        setStaticInvoices(invoiceData);
        setBranches(branchData);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const invoices = useMemo(() => {
    if (staticInvoices === null) return null;
    return [...dynamicInvoices, ...staticInvoices];
  }, [staticInvoices, dynamicInvoices]);

  const branchById = useMemo(() => new Map(branches.map((branch) => [branch.id, branch])), [branches]);

  const usedBranches = useMemo(() => {
    if (!invoices) return [];
    const ids = new Set(invoices.map((invoice) => invoice.branchId));
    return branches.filter((branch) => ids.has(branch.id));
  }, [invoices, branches]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    const filtered = branchFilter ? invoices.filter((invoice) => invoice.branchId === branchFilter) : invoices;
    return [...filtered].sort((a, b) => (sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  }, [invoices, branchFilter, sortAsc]);

  const handleDownload = (invoice: Invoice) => {
    shareInvoicePdf(invoice, branchById.get(invoice.branchId), brand, businessName);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenBackground />
      <LocationBar />
      {invoices === null ? (
        <View style={styles.content}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={[styles.skeleton, { backgroundColor: brand.colors.surface }]} />
          ))}
        </View>
      ) : invoices.length === 0 ? (
        <View style={[styles.content, styles.emptyContainer]}>
          <Ionicons name="document-text-outline" size={48} color={brand.colors.accent} />
          <ThemedText type="title" style={styles.emptyTitle}>
            {strings.rechnungen.empty}
          </ThemedText>
          <ThemedText type="small" color="textSecondary" style={styles.emptyHint}>
            {strings.rechnungen.emptyHint}
          </ThemedText>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
            <FilterChip
              label={strings.rechnungen.allMarkets}
              active={branchFilter === null}
              colors={brand.colors}
              onPress={() => setBranchFilter(null)}
            />
            {usedBranches.map((branch) => (
              <FilterChip
                key={branch.id}
                label={branch.name}
                active={branchFilter === branch.id}
                colors={brand.colors}
                onPress={() => setBranchFilter(branch.id)}
              />
            ))}
          </ScrollView>

          <Pressable onPress={() => setSortAsc((value) => !value)} style={styles.sortRow}>
            <Ionicons name={sortAsc ? 'arrow-up' : 'arrow-down'} size={16} color={brand.colors.textSecondary} />
            <ThemedText type="small" color="textSecondary">
              {strings.rechnungen.filterByDate}: {sortAsc ? strings.rechnungen.sortOldest : strings.rechnungen.sortNewest}
            </ThemedText>
          </Pressable>

          <ScrollView contentContainerStyle={styles.content}>
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                branch={branchById.get(invoice.branchId)}
                colors={brand.colors}
                expanded={expandedId === invoice.id}
                onToggle={() => setExpandedId((current) => (current === invoice.id ? null : invoice.id))}
                onDownload={() => handleDownload(invoice)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: { accent: string; surface: string; border: string; textOnAccent: string; text: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <ThemedText style={[styles.chipText, { color: active ? colors.textOnAccent : colors.text }]}>{label}</ThemedText>
    </Pressable>
  );
}

function InvoiceCard({
  invoice,
  branch,
  colors,
  expanded,
  onToggle,
  onDownload,
}: {
  invoice: Invoice;
  branch: Branch | undefined;
  colors: { surface: string; border: string; accent: string; textOnAccent: string; text: string; textSecondary: string };
  expanded: boolean;
  onToggle: () => void;
  onDownload: () => void;
}) {
  const netByRate = useMemo(() => {
    const map: Record<number, number> = {};
    invoice.items.forEach((item) => {
      map[item.vatRate] = (map[item.vatRate] ?? 0) + item.quantity * item.unitPrice;
    });
    return map;
  }, [invoice.items]);

  const netTotal = Object.values(netByRate).reduce((sum, value) => sum + value, 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <ThemedText type="smallBold">{branch?.name ?? invoice.branchId}</ThemedText>
          <ThemedText type="small" color="textSecondary">
            {formatDate(invoice.date)} · {strings.rechnungen.invoiceNumber} {invoice.invoiceNumber}
          </ThemedText>
        </View>
        <View style={styles.cardHeaderRight}>
          <ThemedText type="subtitle" color="accent">
            {formatEUR(invoice.total)} €
          </ThemedText>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.cardBody}>
          <ThemedText type="smallBold" style={styles.itemsTitle}>
            {strings.rechnungen.itemsTitle}
          </ThemedText>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <ThemedText type="small">{item.name}</ThemedText>
                <ThemedText type="small" color="textSecondary">
                  {item.quantity} {item.unit} × {formatEUR(item.unitPrice)} €
                </ThemedText>
              </View>
              <ThemedText type="small">{formatEUR(item.quantity * item.unitPrice)} €</ThemedText>
            </View>
          ))}

          <View style={[styles.totalsBlock, { borderTopColor: colors.border }]}>
            <View style={styles.totalsRow}>
              <ThemedText type="small" color="textSecondary">
                {strings.rechnungen.subtotal}
              </ThemedText>
              <ThemedText type="small" color="textSecondary">
                {formatEUR(netTotal)} €
              </ThemedText>
            </View>
            {Object.entries(netByRate).map(([rate, net]) => (
              <View key={rate} style={styles.totalsRow}>
                <ThemedText type="small" color="textSecondary">
                  {rate}% {strings.rechnungen.vat}
                </ThemedText>
                <ThemedText type="small" color="textSecondary">
                  {formatEUR(net * (Number(rate) / 100))} €
                </ThemedText>
              </View>
            ))}
            <View style={styles.totalsRow}>
              <ThemedText type="smallBold">{strings.rechnungen.total}</ThemedText>
              <ThemedText type="smallBold">{formatEUR(invoice.total)} €</ThemedText>
            </View>
          </View>

          <Pressable onPress={onDownload} style={[styles.downloadButton, { backgroundColor: colors.accent }]}>
            <Ionicons name="download-outline" size={18} color={colors.textOnAccent} />
            <ThemedText style={[styles.downloadButtonText, { color: colors.textOnAccent }]}>
              {strings.rechnungen.downloadPdf}
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  skeleton: {
    height: 80,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
  },
  chipsRow: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    alignItems: 'flex-start',
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  cardBody: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  itemsTitle: {
    marginBottom: Spacing.one,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  totalsBlock: {
    borderTopWidth: 1,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    gap: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
