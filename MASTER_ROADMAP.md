# MASTER ROADMAP — "C+C Companion" Demo App
### Dual-Brand B2B App: EDEKA Foodservice & Handelshof
**Goal:** A real, polished, installable Phase-1 app running on mock data — convincing enough to win the development contract. Built so that after the GO, only the data layer gets replaced with real integrations.

---

## PHASE 0 — Machine Setup (½ day)
Do once on your Windows PC:

1. Install **Node.js LTS** (nodejs.org)
2. Install **Git** (git-scm.com)
3. Install **VS Code** (optional but recommended as editor)
4. Install **Claude Code** → https://docs.claude.com/en/docs/claude-code (terminal or VS Code extension)
5. On your **Android phone**: install **Expo Go** from Play Store
6. Create free **Expo account** (expo.dev) — needed later for cloud builds

**Checkpoint:** `node -v` and `claude` both run in your terminal.

---

## PHASE 1 — Asset Preparation (parallel to everything, start now)
You're the creative agency — this is your ammunition. Collect into one folder:

- **Logos**: both brands, SVG or high-res PNG, light + dark variants
- **Brand colors**: exact hex codes for both CIs (primary, secondary, accent, backgrounds)
- **Fonts**: the brands' corporate typefaces — ⚠️ check the font licenses permit app embedding; if unclear, pick a close Google Font for the demo (zero licensing risk)
- **Product photos**: 15–25 per brand, square-ish, with their real EAN barcodes noted
- **Customer card**: photo of a real card front/back → tells us the exact barcode format (likely Code-128 or EAN-13) and card layout to replicate
- **Branch list**: the real locations (public info from both websites) — Claude Code can scrape/compile this with you
- **Sample invoice**: one real (anonymized!) invoice as layout reference
- **Offer examples**: a current Angebote flyer/PDF per brand for realistic mock offers

**Checkpoint:** an `/assets-raw` folder you can hand to Claude Code.

---

## PHASE 2 — Foundation Build (Days 1–3 with Claude Code)
Using the kickoff prompt (separate document):

- Expo + TypeScript project scaffolded
- **Brand system**: theme provider, brand selection persists, every screen consumes theme
- **Mock data layer** (`src/data/`) — the swappable heart: brand-keyed JSON + service functions (`getOffers(brand)`, `getCustomerCard(brand)`, …)
- Navigation skeleton: Splash → Brand Picker → Login → Tab navigation
- Splash intro animation + animated brand picker

**Checkpoint:** app runs on your Android phone, brand pick changes the entire look.

---

## PHASE 3 — Core Screens (Days 3–8)
Build order (each step = one Claude Code session, test on phone between steps):

1. **Home/Dashboard** — branded greeting, quick-access tiles, current offers teaser
2. **Digitale Kundenkarte** — full-screen scannable barcode (real, scannable format), brightness auto-boost, card flip animation
3. **Marktfinder** — map with all real branches of the selected brand, GPS "nearest branch", detail sheet (hours, address, call/route buttons)
4. **Angebote** — offers feed, category filters, product cards with photos, branch-specific tagging
5. **Scanner** — camera barcode scan → product detail page (price, Gebinde/bulk info, add to list); seeded with the real EANs from your photo set so live scanning works in the demo
6. **Einkaufsliste** — add from offers/scanner/search, quantities, check-off, share/export
7. **Rechnungen** — invoice list + detail view (mock PDFs/data), filter by Markt and date
8. **Profil/Konto** — business account info, settings, brand switch

**Checkpoint:** every tap in the app lands somewhere real.

---

## PHASE 4 — The Polish Pass (Days 8–12) — *your differentiator*
- **Micro-interactions**: press feedback, list item entrance animations, pull-to-refresh with branded animation
- **Loading bridges**: branded transition animations between sections (Lottie — your team can produce custom ones; placeholders first)
- **Skeleton loaders** instead of spinners (modern feel)
- **Haptics** on key actions (scan success, add to list)
- Dark-polish details: status bar styling, safe areas, keyboard handling, empty states with personality
- German UI copy review — every string, properly Sie-form

**Checkpoint:** it feels like a released product, not a demo.

---

## PHASE 5 — Demo Hardening & iOS (Days 12–15)
- **Demo mode switch**: a hidden gesture to reset all data to pristine state before each presentation
- Offline-proof: everything works with zero internet (mock data is local — no demo killed by Messe-WLAN)
- **Android**: build a standalone APK via EAS → installs on any Android phone without Expo Go
- **iOS**: EAS cloud build → distribute via TestFlight (needs Apple Developer account, $99/yr — start the registration early, approval takes days; company accounts take longer than individual)
- Test the Kundenkarte barcode with a real handheld scanner if you can get access to one

**Checkpoint:** the app installs clean on borrowed iPhones and any Android device.

---

## PHASE 6 — Pitch Day Package
- App on 2–3 devices (charged, demo-reset, airplane-mode-proof)
- Your concept film & deck (your side — already in production)
- **Leave-behind**: QR code → TestFlight / APK download so decision-makers keep playing with it after the meeting (this closes deals)
- One-pager: Phase 2 roadmap (real integrations: SSO/customer DB, ERP/SAP invoices, live offers feed, scan-to-buy POS integration, push notifications), GDPR notes, timeline & budget corridors

---

## PHASE 7 — After the GO (the real contract)
What changes: **only `src/data/`** + auth. What's added:
- API integration with their systems (customer DB, catalog, offers, invoices)
- Real authentication (their customer credentials / SSO)
- GDPR workstream: DPA, privacy policy, data minimization review, German hosting requirements likely
- Push notifications, analytics
- Store submission under **their** developer accounts (Apple org account in their name — start that paperwork immediately at GO, org verification takes weeks)
- Pilot rollout: 1–2 branches → feedback → nationwide

---

## Token/Effort Efficiency Rules
1. **One feature per Claude Code session.** Small focused asks burn fewer tokens than "build everything".
2. **Test on phone after every step** — catching issues early is cheap.
3. **CLAUDE.md** in the project root (the kickoff prompt creates it) — gives every future session instant context, no re-explaining.
4. Come back to chat (here) for **strategy/design decisions**, use Claude Code for **code**. Right tool, right job.
5. Commit to Git after every working feature: `git commit` is your free undo button.

---

## Realistic Timeline
Working part-time alongside agency work: **2–3 weeks to a pitch-ready app.** Focused full-time push: ~10 days. The polish pass (Phase 4) is where you win — don't skip it; it's literally your pitch.
