import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BrandId } from '@/brands';

interface BrandState {
  brandId: BrandId | null;
  hasHydrated: boolean;
  setBrand: (brandId: BrandId) => void;
  clearBrand: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      brandId: null,
      hasHydrated: false,
      setBrand: (brandId) => set({ brandId }),
      clearBrand: () => set({ brandId: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'one-app-brand',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
