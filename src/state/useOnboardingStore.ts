import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BrandId } from '@/brands';

interface OnboardingState {
  scannerExplainerDismissed: Record<BrandId, boolean>;
  dismissScannerExplainer: (brandId: BrandId) => void;
}

const EMPTY: Record<BrandId, boolean> = {
  'edeka-foodservice': false,
  handelshof: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      scannerExplainerDismissed: EMPTY,
      dismissScannerExplainer: (brandId) =>
        set((state) => ({
          scannerExplainerDismissed: { ...state.scannerExplainerDismissed, [brandId]: true },
        })),
    }),
    {
      name: 'one-app-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
