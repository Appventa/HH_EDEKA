import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BrandId } from '@/brands';

export interface ShoppingListItem {
  offerId: string;
  title: string;
  unit: string;
  price: number;
  quantity: number;
  imageId: string;
  category: string;
  /** Branch IDs where this item is currently in stock, if known. */
  availableBranchIds?: string[];
}

export interface AddableItem {
  id: string;
  title: string;
  unit: string;
  price: number;
  imageId: string;
  category: string;
  availableBranchIds?: string[];
}

interface ShoppingListState {
  items: Record<BrandId, ShoppingListItem[]>;
  titles: Record<BrandId, string | null>;
  setTitle: (brandId: BrandId, title: string | null) => void;
  addItem: (brandId: BrandId, item: AddableItem) => void;
  incrementItem: (brandId: BrandId, offerId: string) => void;
  decrementItem: (brandId: BrandId, offerId: string) => void;
  removeItem: (brandId: BrandId, offerId: string) => void;
  clear: (brandId: BrandId) => void;
}

const EMPTY: Record<BrandId, ShoppingListItem[]> = {
  'edeka-foodservice': [],
  handelshof: [],
};

const EMPTY_TITLES: Record<BrandId, string | null> = {
  'edeka-foodservice': null,
  handelshof: null,
};

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set) => ({
      items: EMPTY,
      titles: EMPTY_TITLES,
      setTitle: (brandId, title) => set((state) => ({ titles: { ...state.titles, [brandId]: title } })),
      addItem: (brandId, item) =>
        set((state) => {
          const list = state.items[brandId];
          const existing = list.find((entry) => entry.offerId === item.id);
          const updated = existing
            ? list.map((entry) => (entry.offerId === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
            : [
                ...list,
                {
                  offerId: item.id,
                  title: item.title,
                  unit: item.unit,
                  price: item.price,
                  quantity: 1,
                  imageId: item.imageId,
                  category: item.category,
                  availableBranchIds: item.availableBranchIds,
                },
              ];
          return { items: { ...state.items, [brandId]: updated } };
        }),
      incrementItem: (brandId, offerId) =>
        set((state) => ({
          items: {
            ...state.items,
            [brandId]: state.items[brandId].map((item) =>
              item.offerId === offerId ? { ...item, quantity: item.quantity + 1 } : item,
            ),
          },
        })),
      decrementItem: (brandId, offerId) =>
        set((state) => ({
          items: {
            ...state.items,
            [brandId]: state.items[brandId]
              .map((item) => (item.offerId === offerId ? { ...item, quantity: item.quantity - 1 } : item))
              .filter((item) => item.quantity > 0),
          },
        })),
      removeItem: (brandId, offerId) =>
        set((state) => ({
          items: { ...state.items, [brandId]: state.items[brandId].filter((item) => item.offerId !== offerId) },
        })),
      clear: (brandId) => set((state) => ({ items: { ...state.items, [brandId]: [] } })),
    }),
    {
      name: 'one-app-shopping-list',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
