# Flow audit (30 Sep 2026, automated on the Figma file)

Result after fixes: **275 app screens · 1,497 prototype links · 0 links to missing screens ·
every screen reachable from the splash · 0 dead ends** (every screen has a way forward or back).

## What the first audit found and how it was fixed
- 13 unreachable screens (wrong password, lockout, insufficient balance, withdrawal over limit, 2FA setup ×5,
  KYC needs attention, no live competition, no tickets) → reachable through natural paths
  (2FA off → set up again, KYC review → status) and Profile → About → Version → Demo tools → Error & empty states.
- Pickers that only showed a toast → real sheets: coin (F19), wallet (F17, retitled), bank account (T07),
  fiat currency (G11), payment window (G12), amount filter (G14), collateral (I11), project category (J11),
  blockchain (J12), proof-of-address document (Q11), attach file (Z09).
- Missing screens: self-exclusion (P17/P18), take a break (P20), 2FA turned off (P19), rate trader (G13),
  ticket actions (R07), open-source licences (C10), deposit detail (O05), EUR transaction detail (O06),
  just-placed order detail (E07p), phone SMS verification (B07s), email login code (B03e), upcoming project (J03u),
  USDT flexible subscription (H03u).
- Wrong logic: Bull/Bear payout (+5.40 → +0.54 USDT) and fee wording; notifications all opening "Order filled";
  deposit history opening a withdrawal; transfer coin picker opening Deposit; wallet tabs Earn/Loan/Options/Game
  all showing the Spot wallet; search "clear" jumping to "no results"; phone sign-up verifying by email;
  upcoming projects opening an active sale; "View order" after placing opening a different order.
- 43 tab/filter states drawn as their own frames (markets quote tabs, notification tabs, wallet tabs,
  history tabs, P2P order tabs, Bear side, closed positions, vouchers used/expired, etc.).

## Deliberately in-place (no separate screen, by design)
Toggles, checkboxes and radio choices; show/hide balance; copy / paste; get or resend a code; MAX, ½, ×2;
chart timeframes; list filter chips without a dropdown arrow; order-book price tap (fills the price);
leaderboard paging; favourite star. System actions open the phone's own UI (share sheet, browser for
website/whitepaper/explorer, app store, camera/file chooser after Z09).

## Known prototype simplification
Detail screens use one representative record: every pair opens the BTC/USDT detail and trade screen,
withdrawal rows open the same USDT withdrawal. In the app these screens show the item that was tapped.

## Light version (30 Sep 2026)
Page **04 · CEX App · Light**: all 275 screens as `<ID>L · …` (e.g. `C01L · Home`), NVXO Pay colour style:
white background, #F2F2F7 cards, #000019 text, mint #58F9B0 buttons/pills/toggles with **black** text,
mint-coloured text shown as #0E9F63 for readability, dark-ink logo. Audit: 275 screens, 1,482 links,
0 unresolved, all reachable from the splash, 0 dead ends, 21 flows (one per section).
The earlier 8 light samples (section Y) were removed as superseded.


## Logo update
Official logos applied: 10 logo placements and 32 NVXO coin marks (Dark), 10 and 31 (Light). Added A01h and A01hL (landscape splash, horizontal logo), wired with the same 1.2 s auto-advance as A01/A01L.

## Audit v2 (1 Oct 2026): dead ends and flow gaps

Method: `node tools/audit-flows.js` over the exported design. It lists tappable-looking elements without links, links wired to `self`/`toast`, unreachable screens and screens without an exit. Every design-code link resolves, there are 0 orphans (only A01h, which the app opens in landscape) and 0 screens without an exit.

What felt like dead ends on the phone:
1. **252 taps wired to `self`**: chips, segments, toggles, checkboxes, radio rows, timeframes, stars, MAX, Paste and order-book prices. They were correct in Figma but inert in the app, which is now fixed in the app (see PROGRESS).
2. **Real gaps, fixed in Figma (Dark + Light):**
   - Calendar icons on F21, O03 and Q02 had no date picker. New **Z10 · Choose date** sheet.
   - "⋯" on E01, E02 and E08 only showed a toast. New **E15 · Pair menu** sheet (Price alert, Full chart, About, Trading fees, Favourite, Share).
   - Price alerts didn't exist. New **E16 · Create price alert** and **E17 · Price alerts**.
   - Unwired controls: attach on G05 and R05 → Z09, gavel on G02 → R02, the LTV info icon on I02 → I09.
3. Still toast by design: copy, share, open website or explorer, store links, "Reset demo data".

## Audit v3 (1 Oct 2026): taps that only moved a highlight

Jay tested build 1 on the phone (P2P Sell, P2P coin chips, Markets categories). A chip or segment that only moves its highlight while the list stays the same does not count as working. So every control that filters or changes content now opens its own screen, in Dark and Light (47 new screens per theme):

| Control | Screens |
|---|---|
| P2P Buy / Sell and coin chips | G01s, G01b/e/n, G01sb/se/sn, plus the full sell flow G02s → G02sr → G03s → G03p → G03v → G04s |
| Markets categories and sort | D01l, D01d, D01m, D01x; D01p (by price), D01c (by 24h change) |
| Home and Welcome tabs | C01g/C01n and A05g/A05n were built earlier; they are now wired |
| Pair picker quotes | D06f, D06e (EUR prices), D06b (BTC prices) |
| Chart timeframes | D04q 15m, D04o 1h, D04f 4h, D04w 1W (own candles, volume and axis) |
| Open orders filters | E06b, E06s, E06l, E06k (empty) |
| Order history range | E06h (7 days), E06hm (30 days), E06hq (3 months) |
| Notifications, empty state | C03t, C03w, C03s |
| Simple Earn fixed terms | H01ft, H01fs, H01fn |
| Subscribe duration | H03x (flexible), H03t (30 days) |
| My positions | H05f, H05x |
| Loan orders | I05r (repaid), I05l (liquidated, empty) |
| Address book | F11t, F11c, F11e |

The specs are in `design/specs/filters-oct1.js`. The engine is `tools/figma-variants.js`, plus `tools/figma-chart.js` for the charts.

Still in place by design: choosing an option inside a form. This covers payment method, amount presets, alert presets, P2P filter sheets, the transaction filter sheet, application ranges, the calendar and toggles. The choice is the state, and Continue/Apply moves on.
