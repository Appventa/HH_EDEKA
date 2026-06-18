import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BrandId } from '@/brands';

import { AddableItem } from './useShoppingListStore';

/** Scanner mode: "Zuhause" (planning, off-site) vs "Im Markt" (Scan & Go, in-store). */
export type ScanMode = 'planning' | 'instore';

export interface CartItem {
  productId: string;
  title: string;
  unit: string;
  price: number;
  quantity: number;
  imageId: string;
  category: string;
}

interface CartState {
  items: Record<BrandId, CartItem[]>;
  mode: Record<BrandId, ScanMode>;
  activeBranchId: Record<BrandId, string | null>;
  addItem: (brandId: BrandId, item: AddableItem) => void;
  incrementItem: (brandId: BrandId, productId: string) => void;
  decrementItem: (brandId: BrandId, productId: string) => void;
  removeItem: (brandId: BrandId, productId: string) => void;
  clear: (brandId: BrandId) => void;
  setMode: (brandId: BrandId, mode: ScanMode) => void;
  setActiveBranch: (brandId: BrandId, branchId: string | null) => void;
}

const EMPTY_ITEMS: Record<BrandId, CartItem[]> = {
  'edeka-foodservice': [],
  handelshof: [],
};

const DEFAULT_MODE: Record<BrandId, ScanMode> = {
  'edeka-foodservice': 'planning',
  handelshof: 'planning',
};

const NO_ACTIVE_BRANCH: Record<BrandId, string | null> = {
  'edeka-foodservice': null,
  handelshof: null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: EMPTY_ITEMS,
      mode: DEFAULT_MODE,
      activeBranchId: NO_ACTIVE_BRANCH,
      addItem: (brandId, item) =>
        set((state) => {
          const list = state.items[brandId];
          const existing = list.find((entry) => entry.productId === item.id);
          const updated = existing
            ? list.map((entry) => (entry.productId === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
            : [
                ...list,
                {
                  productId: item.id,
                  title: item.title,
                  unit: item.unit,
                  price: item.price,
                  quantity: 1,
                  imageId: item.imageId,
                  category: item.category,
                },
              ];
          return { items: { ...state.items, [brandId]: updated } };
        }),
      incrementItem: (brandId, productId) =>
        set((state) => ({
          items: {
            ...state.items,
            [brandId]: state.items[brandId].map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
            ),
          },
        })),
      decrementItem: (brandId, productId) =>
        set((state) => ({
          items: {
            ...state.items,
            [brandId]: state.items[brandId]
              .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
              .filter((item) => item.quantity > 0),
          },
        })),
      removeItem: (brandId, productId) =>
        set((state) => ({
          items: { ...state.items, [brandId]: state.items[brandId].filter((item) => item.productId !== productId) },
        })),
      clear: (brandId) => set((state) => ({ items: { ...state.items, [brandId]: [] } })),
      setMode: (brandId, mode) => set((state) => ({ mode: { ...state.mode, [brandId]: mode } })),
      setActiveBranch: (brandId, branchId) =>
        set((state) => ({ activeBranchId: { ...state.activeBranchId, [brandId]: branchId } })),
    }),
    {
      name: 'one-app-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
