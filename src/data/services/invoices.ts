import { BrandId } from '@/brands';

import edekaInvoices from '../mock/edeka-foodservice/invoices.json';
import handelshofInvoices from '../mock/handelshof/invoices.json';
import { Invoice } from '../types';
import { delay } from './delay';

const INVOICES: Record<BrandId, Invoice[]> = {
  'edeka-foodservice': edekaInvoices,
  handelshof: handelshofInvoices,
};

export async function getInvoices(brandId: BrandId): Promise<Invoice[]> {
  await delay();
  return INVOICES[brandId];
}
