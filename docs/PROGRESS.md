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
- [x] 3. Figma prototype wired (926 links, 0 unresolved, 21 flows)
- [ ] 4. Expo app: scaffold + CI → design system → screens by section (commit per section)
- [ ] 5. APK build, visual QA vs Figma, flow walkthrough, test notes

Figma builder: design/figma-lib.js + part*.js; the live copy is stored in the Figma file (shared plugin data nvxo/lib_1..5, load order 1,2,3,5,4).
Extra screens beyond the original map: E06h E06t F06s F11b F13s G03c G03w H01f I02t I06d P15s R02t R04e S01m T05r.
