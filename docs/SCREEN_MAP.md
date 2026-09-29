# NVXO CEX — screen map (single source of truth)

Every screen in the app, its route, and **every tappable element with its destination**.
Figma frames carry the same ID (e.g. `A03`) at the start of their name, so the file, the
prototype and the code line up 1:1. `sheet:` = bottom sheet over the current screen,
`back` = previous screen, `self` = in-place state change on the same screen, `toast` = message.

Scope: the full feature set of the old Fibit/Bitnevex-based APK, re-skinned to NVXO and moved
to EU rails. Removed: Aadhaar, PAN, UPI, INR, Google-reCAPTCHA page, "staging" URLs, website
redirect for P2P (P2P is now native). Added: EU KYC (ID / passport / residence permit, selfie,
proof of address), SEPA fiat, error / empty / system states, confirmations for every money action.

Legal line used in footers: *NVXO CEX is operated by NVXO Europe a.s. (Czech Republic).*

Tab bar (on all `T` screens): Home `/(tabs)` · Markets `/(tabs)/markets` · Trade `/(tabs)/trade` ·
Wallets `/(tabs)/wallets`.

---

## A · Launch & onboarding
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| A01 | Splash | `/` | auto → A02 (first run) / C01 (returning) |
| A02 | Onboarding 1 · Trade | `/onboarding` | Skip → A05 · Next → A03 |
| A03 | Onboarding 2 · Earn | `/onboarding?i=1` | Skip → A05 · Next → A04 |
| A04 | Onboarding 3 · Secure | `/onboarding?i=2` | Get started → B05 · I have an account → B01 |
| A05 | Welcome (guest home) T | `/(tabs)` guest | Sign up → B05 · Log in → B01 · Buy/Sell/Deposit/Withdraw/Referral/Launchpad → B01 (login required) · Support → R01 · More → C04 · Hot pair / Gainers / New tabs → self · pair tile → D04 · View more → D01 · theme → sheet C07 |
| A06 | Wallets (guest) T | `/(tabs)/wallets` guest | Log in → B01 · Register → B05 |

## B · Sign in, sign up, password
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| B01 | Log in · Email | `/auth/login` | Home icon → A05 · Email/Phone tabs → self/B02 · eye → self · Forgot password → B10 · Log in → B03 (2FA on) / C01 · Sign up → B05 |
| B02 | Log in · Phone | `/auth/login?m=phone` | country code → sheet B16 · rest as B01 |
| B03 | Login verification (2FA / email code) | `/auth/login-code` | code boxes · Resend → toast · Use email code instead → self · Verify → C01 · wrong code → B04 |
| B04 | Login error states | `/auth/login` error | wrong password inline · 5 fails → B15 |
| B05 | Sign up · Email | `/auth/register` | tabs → B06 · Terms → B13 · Privacy → B14 · consent check · Register → B07 |
| B06 | Sign up · Phone | `/auth/register?m=phone` | country code → B16 · rest as B05 |
| B07 | Verify email / SMS code | `/auth/register-code` | Resend (60 s) · Change email → back · Verify → B08 · wrong → inline error |
| B08 | Account created | `/auth/welcome` | Verify identity now → Q01 · Explore first → C01 |
| B10 | Forgot password | `/auth/forgot` | Email/Phone tabs · Send code → B11 |
| B11 | Reset code | `/auth/forgot-code` | Resend · Continue → B12 |
| B12 | New password | `/auth/new-password` | strength meter · Save → B17 |
| B13 | Terms of Service | `/legal/terms` | back |
| B14 | Privacy Policy | `/legal/privacy` | back |
| B15 | Account temporarily locked | `/auth/locked` | Reset password → B10 · Contact support → R02 |
| B16 | Country code picker (sheet) | `/picker/country` | search · row → back with value |
| B17 | Password updated | `/auth/password-updated` | Log in → B01 |

## C · Home, menu, notifications
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| C01 | Home T | `/(tabs)` | avatar → C05 · bell → C02 · theme → C07 · banner → K01 / J01 / M01 · Buy → E01 buy · Sell → E01 sell · Deposit → F03 · Withdraw → F08 · Referral → N01 · Support → R01 · Launchpad → J01 · More → C04 · balance eye → self · balance card → F01 · Hot pair/Gainers/New tabs → self · pair tile → D04 · View more → D01 |
| C02 | Notifications | `/notifications` | tabs All/Trades/Wallet/System · Mark all read · Clear → C03 · row → C06 |
| C03 | Notifications · empty | `/notifications` empty | back |
| C04 | All functions (More) | `/more` | Trade → E01 · Wallet → F01 · Referral → N01 · P2P → G01 · Transfer → F16 · Security → P01 · Biometric → P13 · Options → K01 · Prediction → L01 · Competitions → M01 · Simple Earn → H01 · Launchpad → J01 · Crypto Loan → I01 · Vouchers → N04 · Transactions → O01 · Support → R01 |
| C05 | Menu (profile drawer) | `/menu` | Dashboard → S01 · Profile → S02 · Theme → C07 · Security → P01 · Identity verification → Q01 · Payment methods → T01 · Referral → N01 · Vouchers → N04 · Transactions → O01 · Support → R01 · Terms → B13 · Privacy → B14 · About → C09 · Log out → C08 |
| C06 | Notification detail | `/notifications/[id]` | action button → linked screen (e.g. F05 deposit, E07 order) |
| C07 | Appearance (sheet) | `/settings/appearance` | Auto / Dark / Light → self |
| C08 | Log out? (sheet) | `/logout` | Log out → A05 · Cancel → back |
| C09 | About NVXO CEX | `/about` | Terms → B13 · Privacy → B14 · Fees → E13 · version |

## D · Markets
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| D01 | Markets T | `/(tabs)/markets` | quote tabs Favourites/USDT/EUR/BTC → self · search → D02 · sort Name/Price/Change → self · star → self · row → D04 |
| D02 | Market search | `/markets/search` | recent chips · result row → D04 · no match → D03 |
| D03 | Search · no results | `/markets/search` empty | Clear → self |
| D04 | Pair detail (chart) | `/pair/[symbol]` | back · star · timeframe 15m/1h/4h/1D/1W → self · Line/Candles → self · tabs Order book / Trades / Info → self/D05 · Buy → E01 buy · Sell → E01 sell |
| D05 | Pair detail · coin info | `/pair/[symbol]?tab=info` | Website / Whitepaper / Explorer → toast (external) |
| D06 | Pair picker (sheet) | `/picker/pair` | search · quote tabs · row → back |

## E · Spot trading
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| E01 | Trade · Spot · Buy (limit) T | `/(tabs)/trade` | Spot/P2P → G01 · ☰ pair → D06 · chart icon → D04 · Buy/Sell → self/E02 · order type → sheet E03 · price ± · amount · 25/50/75/100 % slider · Pay fees in NVXO toggle → info E14 · Buy → E04 · fee rate ⓘ → E13 · order-book price → fills price · Open orders/History tabs → self · Cancel → E09 · All orders → E06 |
| E02 | Trade · Sell (market) T | `/(tabs)/trade?side=sell` | as E01 · Sell → E04 |
| E03 | Order type (sheet) | `/trade/order-type` | Limit / Market / Stop-limit → back |
| E04 | Confirm order (sheet) | `/trade/confirm` | Confirm → E05 · not enough balance → E10 · Cancel → back |
| E05 | Order placed | `/trade/placed` | View order → E07 · Back to trading → E01 |
| E06 | Orders | `/orders` | tabs Open / History / Trades → self · filter pair → D06 · row → E07 · Cancel all → E09 |
| E07 | Order detail | `/orders/[id]` | Cancel order → E09 · Trade again → E01 |
| E08 | Stop-limit form state | `/(tabs)/trade?type=stop` | as E01 |
| E09 | Cancel order? (sheet) | `/orders/cancel` | Cancel order → toast + back · Keep → back |
| E10 | Insufficient balance | `/trade/insufficient` | Deposit → F03 · Transfer → F16 · Back |
| E13 | Fees & VIP levels | `/fees` | VIP tier row → S03 · back |
| E14 | Pay fees in NVXO (sheet) | `/trade/nvxo-fees` | Turn on/off → back |

## F · Wallets, deposit, withdraw, transfer
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| F01 | Wallets · Overview T | `/(tabs)/wallets` | eye → self · Deposit → F03 · Withdraw → F08 · Transfer → F16 · History → O01 · wallet tabs Spot/Earn/Loan/Options/Game → F02 · search · hide zero → self · asset row → F15 |
| F02 | Wallet balances (per wallet) | `/(tabs)/wallets?w=earn` | Transfer → F16 · row → F15 |
| F03 | Deposit · choose asset | `/deposit` | Crypto/EUR tabs · search · coin row → F04 · EUR → F20 |
| F04 | Deposit crypto (address + QR) | `/deposit/[coin]` | coin → F03 · network → sheet F05 · copy address → toast · Share → share · Save QR → toast · History → F07 · Claim missing deposit → F06 |
| F05 | Network (sheet) | `/picker/network` | row → back |
| F06 | Claim missing deposit | `/deposit/claim` | tx hash · Submit → F06b (submitted state) → F07 |
| F07 | Deposit history | `/deposit/history` | Crypto/EUR tabs · row → O02 |
| F08 | Withdraw · choose asset | `/withdraw` | Crypto/EUR tabs · coin row → F09 · EUR → F24 |
| F09 | Withdraw crypto | `/withdraw/[coin]` | address · scan → F10 · address book → F11 · network → F05 · Max · Withdraw → F12 · History → F14 · limits ⓘ → S03 |
| F10 | Scan QR | `/scan` | torch · paste · auto → back with address |
| F11 | Address book | `/withdraw/addresses` | row → back · Add address → F11b · delete → toast |
| F12 | Review withdrawal | `/withdraw/review` | Confirm → F13 · Edit → back |
| F13 | Security verification (email + SMS + 2FA) | `/withdraw/verify` | Get code × 2 · Submit → F13s (submitted) · wrong → inline |
| F13s | Withdrawal submitted | `/withdraw/submitted` | View details → O02 · Done → F01 |
| F14 | Withdrawal history | `/withdraw/history` | row → O02 |
| F15 | Asset detail | `/asset/[coin]` | Deposit → F04 · Withdraw → F09 · Transfer → F16 · Trade → E01 · Earn → H01 · history row → O02 |
| F16 | Transfer between wallets | `/transfer` | From → sheet F17 · swap ⇅ · To → F17 · coin → sheet · Max · Transfer → F18 |
| F17 | Choose wallet (sheet) | `/picker/wallet` | row → back |
| F18 | Transfer complete | `/transfer/done` | Done → F01 · Transfer again → F16 |
| F20 | Deposit EUR · SEPA details | `/fiat/deposit` | copy IBAN / BIC / reference → toast · I've sent it → F21 · add proof → F21 |
| F21 | Deposit EUR · amount & proof | `/fiat/deposit/confirm` | upload proof → sheet · Submit → F22 |
| F22 | EUR deposit submitted | `/fiat/deposit/submitted` | Done → F01 · History → F07 |
| F24 | Withdraw EUR | `/fiat/withdraw` | bank account → T01 (select) · Add bank account → T03 · Max · Continue → F25 |
| F25 | Withdraw EUR · verification | `/fiat/withdraw/verify` | codes · Confirm → F26 |
| F26 | EUR withdrawal submitted | `/fiat/withdraw/submitted` | Done → F01 |
| F27 | Withdrawal failed · limit / balance | `/withdraw/failed` | Try smaller amount → back · Limits → S03 |

## G · P2P
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| G01 | P2P market | `/p2p` | Buy/Sell tabs · coin chips · fiat → sheet · payment filter → sheet G08 · ad row Buy/Sell → G02 · Orders → G06 · My ads → G07 · Post ad → G09 |
| G02 | Buy from advertiser | `/p2p/ad/[id]` | amount EUR ↔ coin · payment method chips · Buy USDT → G03 |
| G03 | P2P order · pay the seller | `/p2p/order/[id]` | copy details · Chat → G05 · I've paid → G04 sheet · Cancel order → sheet |
| G04 | P2P order completed | `/p2p/order/[id]/done` | View wallet → F01 · Rate trader → toast |
| G05 | P2P order chat | `/p2p/chat/[id]` | send · attach · Appeal → R02 |
| G06 | My P2P orders | `/p2p/orders` | tabs Ongoing/Completed/Cancelled · row → G03 |
| G07 | My ads | `/p2p/my-ads` | online toggle · edit → G09 · Post ad → G09 |
| G08 | Payment method filter (sheet) | `/picker/p2p-payment` | row → back |
| G09 | Post ad (type, price, limits, payment) | `/p2p/post` | Publish → G10 |
| G10 | Ad published | `/p2p/posted` | My ads → G07 |

## H · Simple Earn
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| H01 | Simple Earn | `/earn` | History → H07 · What is Simple Earn → H02 · holdings eye · My positions → H05 · Fixed/Flexible → self · duration chip → self · Subscribe → H03 · ⓘ → H02 |
| H02 | About & product rules | `/earn/about` | Subscribe/Product rules tabs · Flexible/Fixed → self |
| H03 | Subscribe | `/earn/subscribe/[id]` | duration · Max · Buy now → E01 · Transfer → F16 · terms check · Confirm → H04 |
| H04 | Subscription confirmed | `/earn/subscribed` | My positions → H05 · Done → H01 |
| H05 | My positions | `/earn/positions` | row → H06 |
| H06 | Redeem | `/earn/redeem/[id]` | Max · Redeem → H06s |
| H06s | Redeemed | `/earn/redeemed` | Done → H01 |
| H07 | Earn history | `/earn/history` | tabs Subscriptions / Rewards / Redemptions |

## I · Crypto loans
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| I01 | Crypto loans | `/loans` | Borrow row term → I02 · Loan orders → I05 · How it works → sheet I09 |
| I02 | Borrow | `/loans/borrow` | term → sheet · borrow coin → sheet · collateral coin → sheet · ⓘ LTV → I09 · Start borrowing → I03 |
| I03 | Review loan | `/loans/review` | Confirm → I04 · Edit → back |
| I04 | Loan started | `/loans/started` | View loan → I06 · Done → I01 |
| I05 | Loan orders | `/loans/orders` | filters Order/Date/Type · Reset · Repay → I07 · Loan history → I08 · row → I06 |
| I06 | Loan detail | `/loans/[id]` | Repay → I07 · Add collateral → I10 · Due details → sheet |
| I07 | Repay | `/loans/repay/[id]` | Max · Repay → I07s |
| I07s | Loan repaid | `/loans/repaid` | Done → I05 |
| I08 | Loan history | `/loans/history` | row → I06 |
| I09 | How loans & LTV work (sheet) | `/loans/info` | Got it → back |
| I10 | Add collateral | `/loans/collateral/[id]` | Confirm → toast + back |

## J · Launchpad
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| J01 | Launchpad | `/launchpad` | Launch (apply) → J07 · My projects → J09 · active project → J03 · Upcoming View all → J02 |
| J02 | Projects | `/launchpad/projects` | tabs Active/Upcoming/Completed · search · View more → J03 |
| J03 | Project detail | `/launchpad/[id]` | Website / Whitepaper → toast · Transactions → J06 · Subscribe → J04 · social icons |
| J04 | Buy tokens | `/launchpad/[id]/buy` | Max · Confirm → J05 |
| J05 | Purchase confirmed | `/launchpad/bought` | Transactions → J06 · Done → J01 |
| J06 | Launchpad transactions | `/launchpad/transactions` | row → O02 |
| J07 | Apply to launch · Step 1 project | `/launchpad/apply` | Next → J08 |
| J08 | Apply to launch · Step 2 token & docs | `/launchpad/apply/2` | upload → sheet · Submit → J08s |
| J08s | Application submitted | `/launchpad/applied` | My projects → J09 |
| J09 | My projects | `/launchpad/mine` | row → J10 |
| J10 | My project · in review | `/launchpad/mine/[id]` | Edit → J07 |

## K · Options trading
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| K00 | Options risk notice (first use) | `/options/risk` | I understand → K01 |
| K01 | Options trading | `/options` | pair → D06 · chart → D04 · ½ / ×2 · multiplier slider · Calls/Puts → K02 · Positions → K03 · Wallet balance Transfer → F16 |
| K02 | Confirm position (sheet) | `/options/confirm` | Open position → K04 |
| K03 | Positions | `/options/positions` | Open/Closed tabs · Close → K05 |
| K04 | Position opened | `/options/opened` | Positions → K03 |
| K05 | Close position? (sheet) | `/options/close` | Close → toast |

## L · Bull / Bear prediction
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| L00 | Game risk notice (first use, 18+) | `/game/risk` | I understand → L01 |
| L01 | Bull / Bear | `/game` | pair → D06 · Bull/Bear → self · ½ / ×2 · multiplier · Place bet → L02 · How to play → L06 · Bets → L05 |
| L02 | Bet placed · countdown | `/game/live` | auto → L03 / L04 |
| L03 | Result · won | `/game/result?won=1` | Play again → L01 |
| L04 | Result · lost | `/game/result?won=0` | Play again → L01 · Set limits → P12 |
| L05 | My bets | `/game/bets` | Active/Closed tabs |
| L06 | How to play | `/game/rules` | back |

## M · Trading competitions
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| M01 | Competitions · Live | `/competitions` | Live/Completed tabs · Join → M03 · View details → M02 · How it works (expand) |
| M02 | Competition detail & leaderboard | `/competitions/[id]` | Prize fund → M04 · Trade now → E01 · page ‹ › |
| M03 | Joined | `/competitions/joined` | Trade now → E01 |
| M04 | Prize fund | `/competitions/[id]/prizes` | back |
| M05 | Completed competitions | `/competitions?tab=completed` | View more → M06 |
| M06 | Winners | `/competitions/[id]/winners` | page ‹ › |
| M07 | No active competition (empty) | `/competitions` empty | Completed → M05 |

## N · Referral & vouchers
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| N01 | Referral | `/referral` | copy code / link → toast · Invite friends → share · Rules → N03 · Commission history / Referred friends → self/N02 |
| N02 | Referred friends | `/referral?tab=friends` | back |
| N03 | Referral rules | `/referral/rules` | back |
| N04 | Vouchers | `/vouchers` | Available/Used/Expired · Redeem code → N06 · voucher → N05 |
| N05 | Voucher detail | `/vouchers/[id]` | Claim → N07 |
| N06 | Redeem code (sheet) | `/vouchers/redeem` | Redeem → N07 / invalid inline |
| N07 | Voucher claimed | `/vouchers/claimed` | Wallet → F01 · Done → N04 |

## O · Transaction history
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| O01 | Transactions | `/transactions` | tabs Crypto/Fiat/Transfers/Trading/Earn/Launchpad/Loans/Competitions · filter → O03 · row → O02 |
| O02 | Transaction detail | `/transactions/[id]` | copy TxID → toast · View on explorer → toast · Report a problem → R02 |
| O03 | Filter (sheet) | `/transactions/filter` | coin · status · date range · Apply → back |
| O04 | Transactions · empty | `/transactions` empty | Deposit → F03 |

## P · Security
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| P01 | Security | `/security` | Google Authenticator → P02 (off) / P07 (on) · Phone → P08 · Email → P10 · Login password → P11 · Biometric → P13 · Login activity → P14 · Devices → P15 · Anti-phishing code → P16 · Limits → P12 |
| P02 | 2FA · 1 Download app | `/security/2fa` | App Store / Google Play → toast · Next → P03 |
| P03 | 2FA · 2 Scan QR | `/security/2fa?s=2` | copy key · Next → P04 |
| P04 | 2FA · 3 Backup key | `/security/2fa?s=3` | copy · Next → P05 |
| P05 | 2FA · 4 Enter code | `/security/2fa?s=4` | Enable → P06 |
| P06 | 2FA enabled | `/security/2fa-on` | Done → P01 |
| P07 | Disable 2FA | `/security/2fa-off` | codes · Disable → toast + P01 |
| P08 | Change phone | `/security/phone` | Get code × 3 · Submit → P09 |
| P09 | Phone / email updated | `/security/updated` | Done → P01 |
| P10 | Change email | `/security/email` | Get code × 3 · Submit → P09 |
| P11 | Change password | `/security/password` | eye × 3 · Submit → P09 |
| P12 | Limits & responsible trading | `/security/limits` | sliders · Save → toast |
| P13 | Biometric sign-in | `/security/biometric` | toggle → system prompt |
| P14 | Login activity | `/security/activity` | row → sheet detail |
| P15 | Devices & sessions | `/security/devices` | Log out device → toast · Log out all other sessions → sheet |
| P16 | Anti-phishing code | `/security/anti-phishing` | Save → toast |

## Q · Identity verification (EU KYC)
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| Q01 | Verification status · not verified | `/kyc` | Start → Q02 · level rows → Q10 |
| Q02 | Step 1 · Personal details | `/kyc/personal` | nationality → B16 · date → picker · Continue → Q03 |
| Q03 | Step 2 · Choose document | `/kyc/document` | country → B16 · ID card / Passport / Residence permit / Driving licence → Q04 |
| Q04 | Step 2 · Photo of document (front/back) | `/kyc/capture` | Take photo / Upload → self (captured) · Retake · Continue → Q05 |
| Q05 | Step 3 · Selfie / liveness | `/kyc/selfie` | Start → self (captured) · Submit → Q06 |
| Q06 | Verification in review | `/kyc/review` | Back to home → C01 |
| Q07 | Verified | `/kyc` verified | Level 2 → Q09 · Done |
| Q08 | Needs attention (rejected item) | `/kyc/attention` | Retry document → Q04 · Support → R02 |
| Q09 | Level 2 · Proof of address | `/kyc/address` | upload → sheet · Submit → Q06 |
| Q10 | Verification levels & limits | `/kyc/levels` | Verify → Q02 |

## R · Support
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| R01 | Support | `/support` | Create ticket → R02 · Your tickets → R04 · FAQ topics → R06 · Email → toast |
| R02 | Create ticket | `/support/new` | issue → sheet · attachment → sheet · Create ticket → R03 · missing issue → inline error |
| R03 | Ticket created | `/support/created` | View ticket → R05 · Done → R01 |
| R04 | Your tickets | `/support/tickets` | row → R05 · empty → R04e: Submit a ticket → R02 |
| R05 | Ticket conversation | `/support/tickets/[id]` | reply · attach · Close ticket → toast |
| R06 | Help article | `/support/article/[id]` | Helpful yes/no → toast · Contact support → R02 |

## S · Account
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| S01 | Dashboard | `/dashboard` | UID copy · profile card → S02 · eye · Deposit → F03 · Withdraw → F08 · Wallet → F01 · wallet select → F17 · filter · Transfer/Deposit per row → F16/F04 · ⋮ → sheet (Withdraw, Trade, Details) |
| S02 | Profile | `/profile` | VIP level → S03 · 2FA → P01 · Identity → Q01 · avatar edit → sheet |
| S03 | VIP level & limits | `/vip` | Fees → E13 |

## T · Payment methods
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| T01 | Payment methods | `/payment-methods` | + Add → T02 · Disable → sheet · row → T05 |
| T02 | Add payment method | `/payment-methods/add` | Bank (SEPA) → T03 · Revolut → T04 · Wise → T04 |
| T03 | Add bank account (IBAN) | `/payment-methods/bank` | Save → T06 |
| T04 | Add Revolut / Wise | `/payment-methods/app` | Save → T06 |
| T05 | Payment method detail | `/payment-methods/[id]` | Remove → sheet → T01 |
| T06 | Payment method added (pending check) | `/payment-methods/added` | Done → T01 |

## Z · System states
| ID | Screen | Route | Tappable → target |
|---|---|---|---|
| Z01 | Maintenance | `/system/maintenance` | Refresh → toast · Status page → toast |
| Z02 | Update required | `/system/update` | Update → toast |
| Z03 | Session expired | `/system/session` | Log in → B01 |
| Z04 | No connection | `/system/offline` | Try again |
| Z05 | Server error (504) | `/system/error` | Try again · Support → R01 |
| Z06 | Loading | `/system/loading` | — |
| Z07 | Login required (sheet) | `/system/login-required` | Log in → B01 · Sign up → B05 |
| Z08 | Demo tools (demo build only) | `/settings/demo` | reset data · jump to any system state |
