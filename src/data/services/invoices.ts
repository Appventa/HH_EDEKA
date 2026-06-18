import { BrandId } from '@/brands';

import edekaInvoices from '../mock/edeka-foodservice/invoices.json';
import handelshofInvoices from '../mock/handelshof/invoices.json';
import { Invoice, InvoiceItem } from '../types';
import { delay } from './delay';

const INVOICES: Record<BrandId, Invoice[]> = {
  'edeka-foodservice': edekaInvoices,
  handelshof: handelshofInvoices,
};

export async function getInvoices(brandId: BrandId): Promise<Invoice[]> {
  await delay();
  return INVOICES[brandId];
}

interface PurchaseItem {
  title: string;
  quantity: number;
  unit: string;
  price: number;
}

export function buildInvoice(items: PurchaseItem[], branchId: string, brandId: BrandId): Invoice {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const invoiceItems: InvoiceItem[] = items.map((item) => ({
    name: item.title,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.price,
    vatRate: 7, // food service bulk: reduced VAT rate
  }));
  const total = Math.round(invoiceItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) * 100) / 100;
  return {
    id: `dynamic-${brandId}-${now}`,
    invoiceNumber: String(now).slice(-7),
    date: today,
    branchId,
    total,
    items: invoiceItems,
  };
}
