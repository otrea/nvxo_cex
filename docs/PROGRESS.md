# NVXO CEX — progress (resume from here)

Repo: otrea/nvxo_cex (NOT nvxo-pay-app — never push there).
Figma: file `wVlDFac6AMFxay2jcgVajH` "CEX NVXO" (Pro team).
Source APK audited: CEX_nvxo_04_26.apk (Flutter "Fibit/Bitnevex" white-label, api.nvxo.io backend).

Resume rule: don't redo anything ticked. Read this file + docs/SCREEN_MAP.md, continue at the first unticked item.

Decisions (Jay, 30 Sep 2026): all modules kept, on EU rails (no UPI/Aadhaar/PAN; SEPA + EU KYC);
old Figma material → Archive page (not deleted); APK = clickable demo with local data (like NVXO Pay);
design = NVXO dark (SUSE, mint #58F9B0, black), Day theme supported in app.

## Phases
- [x] 0. Audit + screen map (docs/SCREEN_MAP.md)
- [x] 1. Figma reorganised into pages (App / Website / Assets / Archive)
- [x] 2. All screens built in Figma: 209 app screens (A–Z) + design system (00) + 8 light samples (Y); IDs in docs/FIGMA_NODES.md
- [x] 3. Figma prototype wired and audited: 275 screens, 1,497 links, 0 unresolved, all reachable, 0 dead ends (docs/AUDIT.md)
- [x] 3b. Full Light version in Figma (page 04, 275 screens, wired + audited; docs/THEME.md)
- [ ] 4. Expo app: scaffold + CI → design system → screens by section (commit per section)
- [ ] 5. APK build, visual QA vs Figma, flow walkthrough, test notes

Figma builder: design/figma-lib.js + part*.js; the live copy is stored in the Figma file (shared plugin data nvxo/lib_1..5, load order 1,2,3,5,4).
Extra screens beyond the original map: E06h E06t F06s F11b F13s G03c G03w H01f I02t I06d P15s R02t R04e S01m T05r.
Figma library parts now 1,2,3,5,6,4 (lib_6 = light recolour routine BL.__light).

- Sep 30: horizontal logo spacing fixed (the NVXO/symbol and symbol/CEX gaps were 6.23 and 7.21; both are now 6.72, and the symbol moved +0.49). The vertical logo was already even (3.68/3.70).
- Sep 30: dark mint removed from both themes; new tab bar (mint pill, no outline); Light Menu/Appearance now show Light; the token sheet's Light row updated.
- The live builder library in Figma plugin data (lib_1..6) is the source of truth. The local design/*.js copies are older snapshots.

## Phase: clickable demo APK — done (30 Sep 2026)

- Build 1: https://github.com/otrea/nvxo_cex/releases/download/build-1/NVXO-CEX-1.apk (CI run #1, green)
- All 276 screens × Dark/Light are rendered straight from the Figma export (`src/design/*.json`) by a generic renderer (`src/render/`). If the Figma file changes, re-run the export and the APK follows; there is no hand-coded screen.
- Every prototype link works. Tabs and segments swap in place, sheets fade in over the screen behind them, copy/share actions show a toast, and splash auto-advances. The splash switches to A01h in landscape. Orientation is not locked.
- Appearance (Menu → Appearance, C07) switches Automatic / Dark / Light and persists.
- QA: all 552 screen×theme combinations were screenshotted in Chromium with zero runtime errors. C01 was compared side by side with Figma and is a near pixel match. Typecheck and lint are clean.
- Known limits: 'self' taps (radio rows, MAX, Paste) give haptic feedback only and do not change state. Inputs are static, as designed. Figma MAX alignment is exported as MIN (rarely used).

## Phase: audit v2 (1 Oct 2026)

- Flow audit (`tools/audit-flows.js`). Every link resolves, there are 0 orphans and 0 screens without an exit. The dead ends came from same-screen ("self") taps and a few real gaps; details in AUDIT.md.
- New screens in Figma, Dark and Light: Z10 Choose date, E15 Pair menu, E16 Create price alert, E17 Price alerts. 11 controls were wired in each theme.
- Subtle gradients in Figma and the app (THEME.md): a top glow on every screen, a sheen on hero cards and banners, and a light-to-fresh mint highlight on primary buttons and success circles.
- App: same-screen taps now have state (`src/render/interact.ts`).
  - Chips, segments, tabs, radio rows and calendar days select.
  - Multi-select chips, toggles, checkboxes and stars flip.
  - MAX, Paste, Get code, Send and similar show a confirmation.
  - Unlinked switches and checkboxes are tappable too.
- QA: all 560 screens in both themes rendered with 0 runtime errors. Tap tests passed on E16, Z10, G09, H03, G08, H05, D04, J04, O03 and F02. Typecheck and lint are clean.

## Phase: content screens for every filter (1 Oct 2026), waiting for Jay's approval

- Figma rolled back to plain white/black backgrounds. Gradients stay only on 52 px primary and Buy buttons (THEME.md).
- 47 new screens per theme for chips, segments and tabs that change content (AUDIT.md, audit v3). All are wired with prototype links. The export index now has 327 pairs, and `exp_new` lists the new codes.
- Fixes: the loan card order id no longer wraps; G02s "I sell" is active.
- **Next, after approval only:**
  1. Export the changed and new screens. Rebuild the export from the pre-gradient base with button gradients only.
  2. App: remove the root glow. Restrict the landscape variant to real landscape frames: `code+'h'` wrongly maps E06 → E06h (history).
  3. QA, push, and build 3 APK.
