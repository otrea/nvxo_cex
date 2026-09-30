# Theme tokens (app + Figma)

| Token | Dark | Light (NVXO Pay style) |
|---|---|---|
| bg | #000000 | #FFFFFF |
| card | #121318 | #F2F2F7 |
| card2 | #1C1D24 | #E8E8EE |
| line | #2A2B33 | #E2E0E8 |
| fg (text) | #FFFFFF | #000019 |
| sec (secondary text) | #B9BAC1 | #2A2A3C |
| mut (muted text) | #7C7D86 | #6B6B78 |
| mint (fills: buttons, pills, toggles) | #58F9B0 | #58F9B0 |
| onMint (text on mint) | #000000 | #000000 |
| accent (mint-coloured text/icons) | #58F9B0 | #000019 (no dark mint) |
| chart line / candles up / gains | #58F9B0 | #000019 (black; losses stay red) |
| neg | #FF4D5E | #E5374A |
| warn | #FFB547 | #C47A00 |
| info | #6AB2FF | #2F7FE0 |
| gold (VIP) | #D4B45F | #A8862E |
| tab bar | #0D0E12 | #F7F7FA |
Font: SUSE (numbers/addresses SUSE Mono). Icons: Material Icons Round.

Theme switch icon in the header shows the mode you switch *to*: Dark shows a sun (light_mode), Light shows a moon (dark_mode).

Icon circles: Light = fresh mint #58F9B0 circle with black icon (all action/menu/list icons). Exceptions kept on purpose: warning (orange) and danger (red) icons, grey "inactive/empty" icons, and close (X) buttons. Dark = #1C1D24 circle with mint icon.

Balance card (home, wallets, asset detail, dashboard): Light = solid fresh-mint card, black text (secondary 62% black), black primary button with mint text, other buttons 10% black; Dark = solid #121318 card, no outline, no gradient, mint primary button.

## Logos (official SVGs in `assets/brand/`)

| Use | Asset | Dark | Light |
|---|---|---|---|
| Launch splash, portrait (A01 / A01L) | `cex_logo_vertical.svg` | mint #58F9B0 | black |
| Launch splash, landscape (A01h / A01hL, 852x393) | `cex_logo_horizontal.svg` | mint | black |
| Headers, sign-in, About, guest home | `cex_logo_horizontal.svg` | mint | black |
| NVXO coin | solid circle with the three dots of `nvxo_coin.svg` cut out (dots at 63% scale), no square, no ring | mint | black |
| App icon / native splash | `cex_symbol.svg` | mint on black | - |

Rule in the app: the JS splash picks the vertical logo when height > width and the horizontal one otherwise (`useWindowDimensions`), so orientation must not be locked to portrait.
Figma components ("03 · Assets & brand"): Logo / NVXO CEX, … black, … vertical, … vertical black, Logo / NVXO mark, … black (CEX symbol, for app icon), Logo / NVXO coin round (mint), … round black (coin). Previous logo components are kept, suffixed "(old)".


## Mint rule (Sep 30)

- Mint appears only as the fresh solid #58F9B0: filled buttons, pills, tags, chips and icon circles with black content, and (Dark only) as text or icon colour on black.
- No dark mint anywhere: no #0E9F63 or #12B886, no translucent mint tints (they read as dark mint on black), and no green gradients.
- Light: links and accents are black SemiBold; gains are black with a "+" sign, losses are red; candles are black and red; sparklines are black and red.
- Neutral greys replace tints: order-book depth bars use card2, volume bars use line, success notices and status circles use card, current-row highlights use card2, and onboarding rings are fg at 3% (Light) or 4.5% (Dark).
- Promo banners: Light is a solid mint card with black content (a black tag and a black icon circle with mint content); Dark is a plain card.
- Coin brand colours (USDT, PEPE…) are not part of this rule.

## Tab bar

- No outline: the bar sits on the `tab` surface (#0D0E12 / #F7F7FA).
- The active tab is a 56x30 solid mint pill with a black 22 px icon and an fg SemiBold label. Inactive tabs have mut icons and labels.
