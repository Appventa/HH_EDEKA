import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  stayLoggedIn: boolean;
  businessName: string | null;
  hasHydrated: boolean;
  login: (businessName: string, stayLoggedIn: boolean) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      stayLoggedIn: false,
      businessName: null,
      hasHydrated: false,
      login: (businessName, stayLoggedIn) => set({ isLoggedIn: true, businessName, stayLoggedIn }),
      logout: () => set({ isLoggedIn: false, businessName: null, stayLoggedIn: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'one-app-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
