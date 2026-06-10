# KICKOFF PROMPT — paste this into Claude Code as your first message
(Run Claude Code inside an empty folder, e.g. `C:\dev\cc-companion`, then paste everything below the line.)

---

I'm building a dual-brand B2B demo app for two German cash-and-carry wholesale brands: **EDEKA Foodservice** and **Handelshof** (same parent company). It's a fully functional Phase-1 app running entirely on local mock data — architected so the data layer can later be swapped for real APIs without touching the UI. Target: polished enough to demo to company management on real devices. All UI text in **German (Sie-Form)**.

## Stack & Setup
- **Expo (latest SDK) + React Native + TypeScript**, managed workflow
- Navigation: expo-router
- Animations: react-native-reanimated + moti, lottie-react-native for splash/transitions
- Barcode scanning: expo-camera
- Barcode RENDERING (customer card): react-native-svg based barcode generation (Code-128)
- Maps: react-native-maps, location: expo-location
- State: zustand; persistence: @react-native-async-storage/async-storage
- Haptics: expo-haptics
- I develop on Windows, test via Expo Go on Android. Set up the project accordingly.

## Architecture requirements (critical)
1. **Brand system**: After splash, user picks a brand. The choice loads a complete brand config: colors, logos, fonts, brand name, and namespaces ALL data. Implement as `src/brands/edeka-foodservice.ts` and `src/brands/handelshof.ts` exporting a typed `BrandConfig`, consumed app-wide via a ThemeProvider/context. Brand is switchable from the profile screen. Placeholder colors for now: EDEKA Foodservice = yellow (#FFD500) / dark blue (#003B7C); Handelshof = red (#E2001A) / dark grey (#2B2B2B). I will replace with exact CI values and real logo files later — structure asset folders as `assets/brands/<brand>/` so drop-in replacement is trivial.
2. **Mock data layer**: ALL data access goes through `src/data/services/` (e.g. `getOffers(brandId)`, `getCustomerCard(brandId)`, `getBranches(brandId)`, `getInvoices(brandId)`, `getProductByEAN(brandId, ean)`). Services are async and read from brand-keyed JSON in `src/data/mock/`. Simulate 300–600ms latency so loading states are visible/demoable. NO component ever imports mock JSON directly. Later, only this services folder changes to hit real APIs.
3. **Demo mode**: hidden long-press (3s) on the profile screen avatar → "Demo zurücksetzen" → wipes AsyncStorage to pristine state.
4. Everything must work fully offline.

## Screens (build in this order, one at a time — after each, stop so I can test on my phone)
1. **Splash**: animated logo intro (placeholder Lottie or Reanimated logo animation — I'll deliver custom Lottie files later, make them swappable)
2. **Brand Picker**: two large animated brand cards, slick selection transition into the chosen brand's world
3. **Login**: branded, mock credentials (any input works, plus a visible demo hint), "Angemeldet bleiben"
4. **Tab navigation**: Start, Karte (Kundenkarte), Märkte, Angebote, Liste — plus Scanner as floating action; Rechnungen & Profil reachable from Start/header
5. **Start/Dashboard**: greeting with mock business name ("Guten Tag, Restaurant Adler"), quick tiles, offers teaser carousel
6. **Digitale Kundenkarte**: full-screen scannable Code-128 barcode with customer number, screen-brightness boost while visible, card flip animation for details
7. **Märkte (Marktfinder)**: map of the selected brand's branches with mock coordinates around Germany (I'll provide the real branch list later — structure it as JSON I can replace), nearest-branch via GPS, bottom-sheet branch details
8. **Angebote**: offers feed, category chips, product cards (placeholder images in `assets/products/` — I'll replace with real photos), price + Gebinde info, add-to-list
9. **Scanner**: camera EAN scan → product detail; mock catalog keyed by real EANs (seed ~10 placeholder entries, I'll provide real EANs + photos)
10. **Einkaufsliste**: quantities, swipe-to-delete, check-off with animation, persists per brand
11. **Rechnungen**: invoice list with mock data, filters, detail view
12. **Profil**: business account info, brand switch, demo reset (hidden)

## Quality bar
- Modern, slick: micro-interactions on every touch, skeleton loaders (never bare spinners), animated screen transitions, branded "loading bridge" transition component used between major sections, haptic feedback on scan-success and add-to-list, polished empty states
- Clean TypeScript, small components, no `any`
- German UI copy throughout, professional B2B tone (Sie)

## First task — do this now:
1. Scaffold the Expo project with the dependencies above
2. Create a **CLAUDE.md** documenting this entire architecture, the brand system, the data-layer rule, screen list and conventions — so every future session has full context
3. Initialize git with a sensible .gitignore and make the first commit
4. Implement: brand config system + ThemeProvider, the mock data layer skeleton with sample JSON for both brands, Splash, Brand Picker, Login, and the tab navigation shell
5. Tell me how to start it and connect my Android phone via Expo Go

Then stop and wait for my test feedback before building further screens.
