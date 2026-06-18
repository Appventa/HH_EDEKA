import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BrandId } from '@/brands';

export interface TeamAuthorization {
  id: string;
  name: string;
  email: string;
  /** ISO date (YYYY-MM-DD) */
  startDate: string;
  /** ISO date (YYYY-MM-DD) */
  endDate: string;
}

export const MAX_TEAM_AUTHORIZATIONS = 10;

interface TeamState {
  authorizations: Record<BrandId, TeamAuthorization[]>;
  addAuthorization: (brandId: BrandId, auth: Omit<TeamAuthorization, 'id'>) => void;
  removeAuthorization: (brandId: BrandId, id: string) => void;
}

const EMPTY: Record<BrandId, TeamAuthorization[]> = {
  'edeka-foodservice': [],
  handelshof: [],
};

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      authorizations: EMPTY,
      addAuthorization: (brandId, auth) =>
        set((state) => {
          const list = state.authorizations[brandId];
          if (list.length >= MAX_TEAM_AUTHORIZATIONS) return state;
          return {
            authorizations: {
              ...state.authorizations,
              [brandId]: [...list, { ...auth, id: `team-${Date.now()}` }],
            },
          };
        }),
      removeAuthorization: (brandId, id) =>
        set((state) => ({
          authorizations: {
            ...state.authorizations,
            [brandId]: state.authorizations[brandId].filter((entry) => entry.id !== id),
          },
        })),
    }),
    {
      name: 'one-app-team',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
