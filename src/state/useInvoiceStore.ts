import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BrandId } from '@/brands';
import { Invoice } from '@/data/types';

interface InvoiceStoreState {
  dynamicInvoices: Record<BrandId, Invoice[]>;
  addInvoice: (brandId: BrandId, invoice: Invoice) => void;
  reset: () => void;
}

const EMPTY: Record<BrandId, Invoice[]> = {
  'edeka-foodservice': [],
  handelshof: [],
};

export const useInvoiceStore = create<InvoiceStoreState>()(
  persist(
    (set) => ({
      dynamicInvoices: EMPTY,
      addInvoice: (brandId, invoice) =>
        set((state) => ({
          dynamicInvoices: {
            ...state.dynamicInvoices,
            [brandId]: [invoice, ...state.dynamicInvoices[brandId]],
          },
        })),
      reset: () => set({ dynamicInvoices: EMPTY }),
    }),
    {
      name: 'one-app-dynamic-invoices',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
