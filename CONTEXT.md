# CONTEXT — "ONE" Dual-Brand B2B App

A fully functional Phase-1 demo app for two German cash-and-carry wholesale brands —
**EDEKA Foodservice ONE** and **Handelshof ONE** (same parent company) — running entirely
on local mock data. Architected so only the data layer and auth need to change for the
real integration (Phase 7, see `MASTER_ROADMAP.md`).

Stack: Expo SDK 56 + React Native 0.85 + TypeScript, expo-router, Reanimated 4 + Moti,
Zustand + AsyncStorage. All UI copy is German, **Sie-Form**.

## Brand system

- `src/brands/types.ts` — `BrandConfig` type (id, names, color palette, logo paths).
- `src/brands/edeka-foodservice.ts`, `src/brands/handelshof.ts` — concrete configs.
  Placeholder colors: EDEKA Foodservice ONE = yellow `#FFD500` / dark blue `#003B7C`;
  Handelshof ONE = red `#E2001A` / dark grey `#2B2B2B`. Replace with exact CI values
  when available.
- `src/theme/ThemeProvider.tsx` — `BrandThemeProvider`, `useBrand()`, `useBrandColors()`.
  Reads the active brand from `useBrandStore` (Zustand, persisted). Falls back to
  EDEKA Foodservice ONE before a brand is picked.
- Brand is chosen on `/brand-picker` and switchable from `/profil`.
- Real logo files go in `assets/brands/<brand-id>/` (paths referenced in
  `BrandConfig.logo`, currently unused — `BrandLogo` renders a text placeholder until
  real assets are dropped in).

## Data layer rule (critical)

**No component imports mock JSON directly.** All data access goes through
`src/data/services/*.ts`:

- `getOffers(brandId)`, `getOfferCategories(brandId)`
- `getBranches(brandId)`, `getBranchById(brandId, branchId)`
- `getProducts(brandId)`, `getProductByEAN(brandId, ean)`
- `getInvoices(brandId)`
- `getCustomerCard(brandId)`

Each service is `async`, reads from brand-keyed JSON in `src/data/mock/<brand-id>/`,
and awaits `delay()` (300–600ms) to simulate latency so loading states are demoable.

**When real APIs arrive (Phase 7), only `src/data/services/` changes** — function
signatures stay the same, implementations swap from JSON reads to fetch calls.

Shared types for all mock entities live in `src/data/types.ts`.

## State

- `src/state/useBrandStore.ts` — selected brand, persisted to AsyncStorage.
- `src/state/useAuthStore.ts` — login state, business name, "Angemeldet bleiben",
  persisted to AsyncStorage.
- Both stores expose `hasHydrated` so the splash screen can wait for rehydration
  before deciding where to route.

## Navigation flow

```
/ (Splash, animated, ~1.4s)
  -> /brand-picker   (no brand selected yet)
  -> /login          (brand selected, not logged in)
  -> /(tabs)         (brand selected + logged in)
```

`(tabs)`: Start, Karte (Kundenkarte), Scanner (center), Angebote, Liste, Märkte.
`/rechnungen` and `/profil` are stack screens reachable via the tab header
(person icon) and Start's quick-access tiles.

## Demo mode

`/profil` — long-press (3s) the avatar to wipe `AsyncStorage` (brand + auth) and
return to the splash/brand-picker, per `strings.profil.demoReset`.

## Conventions

- All user-facing copy lives in `src/constants/strings.ts` (German, Sie-Form) — edit
  wording there, not inline in screens.
- `ThemedText` / `ThemedView` consume the active brand's colors via `useBrandColors()`.
- Spacing/layout constants in `src/constants/theme.ts`.
- Screens not yet built use `<PlaceholderScreen />` to keep the tab shell navigable.

## Build order (one screen per session, test on phone between steps)

1. ~~Splash, Brand Picker, Login, Tab shell~~ (done)
2. ~~Start/Dashboard refinement~~ (done)
3. ~~Digitale Kundenkarte (Code-128 barcode, brightness boost, flip animation)~~ (done)
4. ~~Märkte (Marktfinder) — map, nearest branch, branch detail sheet~~ (done)
5. ~~Angebote — feed, category filters, product cards~~ (done)
6. ~~Scanner — camera EAN scan -> product detail~~ (done)
7. ~~Einkaufsliste — quantities, +/- steppers, persistence~~ (done)
8. ~~Rechnungen — invoice list + detail~~ (done)
9. Profil refinements

See `MASTER_ROADMAP.md` for the full phased plan and `CLAUDE_CODE_KICKOFF_PROMPT.md`
for the original brief.
