import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface InventoryStoreState {
  additions: Record<string, number>;
  addPurchase: (items: Array<{ inventoryItemId: string; quantity: number }>) => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryStoreState>()(
  persist(
    (set) => ({
      additions: {},
      addPurchase: (items) =>
        set((state) => {
          const next = { ...state.additions };
          for (const { inventoryItemId, quantity } of items) {
            next[inventoryItemId] = (next[inventoryItemId] ?? 0) + quantity;
          }
          return { additions: next };
        }),
      reset: () => set({ additions: {} }),
    }),
    {
      name: 'one-app-inventory-additions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
