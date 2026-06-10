import { createContext, ReactNode, useContext, useMemo } from 'react';

import { BrandConfig, brands } from '@/brands';
import { useBrandStore } from '@/state/useBrandStore';

const FALLBACK_BRAND: BrandConfig = brands['edeka-foodservice'];

const BrandThemeContext = createContext<BrandConfig>(FALLBACK_BRAND);

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const brandId = useBrandStore((state) => state.brandId);

  const brand = useMemo(() => (brandId ? brands[brandId] : FALLBACK_BRAND), [brandId]);

  return <BrandThemeContext.Provider value={brand}>{children}</BrandThemeContext.Provider>;
}

/** Returns the active brand's full config (colors, names, logo paths). */
export function useBrand(): BrandConfig {
  return useContext(BrandThemeContext);
}

/** Convenience hook for just the active brand's color palette. */
export function useBrandColors() {
  return useContext(BrandThemeContext).colors;
}
