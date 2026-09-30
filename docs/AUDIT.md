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
