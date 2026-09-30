// Content-state screens (1 Oct 2026): every chip / tab / segment that filters content gets its own screen.
// Built with tools/figma-variants.js (plugin data nvxo/var_lib) on both pages.
const SIDE = ['Buy', 'Sell'], COINS = ['USDT', 'BTC', 'ETH', 'NVXO'];
const buyCoin = (code, coin, px, av) => ({ src: 'G01', code, name: 'P2P market · ' + coin, ops: [
  ['act', COINS, coin],
  ['text', [['0.923 EUR', px[0]], ['0.925 EUR', px[1]], ['0.927 EUR', px[2]],
    ['12,480 USDT', av[0], null, 'sub'], ['180,000 USDT', av[1], null, 'sub'], ['2,130 USDT', av[2], null, 'sub']]]] });
const sellCoin = (code, coin, px, av) => ({ src: 'G01s', code, name: 'P2P market · sell ' + coin, ops: [
  ['act', COINS, coin],
  ['text', [['0.919 EUR', px[0]], ['0.918 EUR', px[1]], ['0.916 EUR', px[2]],
    ['8,000 USDT', av[0], null, 'sub'], ['95,000 USDT', av[1], null, 'sub'], ['1,500 USDT', av[2], null, 'sub']]]] });

const P2P = [
  { src: 'G01', code: 'G01s', name: 'P2P market · sell', ops: [
    ['act', SIDE, 'Sell'],
    ['btn', 'Buy', 'Sell', 'sell'],
    ['text', [['0.923 EUR', '0.919 EUR'], ['0.925 EUR', '0.918 EUR'], ['0.927 EUR', '0.916 EUR'],
      ['Available 12,480 USDT', 'Buying up to 8,000 USDT'], ['Available 180,000 USDT', 'Buying up to 95,000 USDT'], ['Available 2,130 USDT', 'Buying up to 1,500 USDT'],
      ['Petra S.', 'Tomáš K.'], ['PS', 'TK'], ['1,284 orders · 99.2% completion', '642 orders · 98.9% completion'],
      ['Martin K.', 'Eva N.'], ['MK', 'EN'], ['312 orders · 97.4% completion', '208 orders · 99.0% completion']]],
    ['linkAll', 'Sell', 'G02s']] },
  buyCoin('G01b', 'BTC', ['62,180 EUR', '62,240 EUR', '62,310 EUR'], ['0.1920 BTC', '2.8500 BTC', '0.0340 BTC']),
  buyCoin('G01e', 'ETH', ['3,190 EUR', '3,196 EUR', '3,204 EUR'], ['3.9000 ETH', '56.000 ETH', '0.6600 ETH']),
  buyCoin('G01n', 'NVXO', ['5.781 EUR', '5.790 EUR', '5.802 EUR'], ['2,150 NVXO', '31,000 NVXO', '370 NVXO']),
  sellCoin('G01sb', 'BTC', ['61,940 EUR', '61,880 EUR', '61,820 EUR'], ['0.1300 BTC', '1.5000 BTC', '0.0240 BTC']),
  sellCoin('G01se', 'ETH', ['3,178 EUR', '3,174 EUR', '3,170 EUR'], ['2.5000 ETH', '30.000 ETH', '0.4700 ETH']),
  sellCoin('G01sn', 'NVXO', ['5.752 EUR', '5.748 EUR', '5.740 EUR'], ['1,400 NVXO', '16,500 NVXO', '260 NVXO']),
  // sell flow
  // G02r has "I receive" active; after the texts, the segment is swapped by hand so "I sell" is active
  // (two-item segments have no unique active style for the engine) and "I receive" links to G02sr.
  { src: 'G02r', code: 'G02s', name: 'Sell to advertiser', ops: [
    ['text', [['I pay', 'I sell'], ['Buy USDT', 'Sell USDT'], ['Petra S.', 'Tomáš K.'], ['PS', 'TK'],
      ['1,284 orders · 99.2% completion · avg. release 6 min', '642 orders · 98.9% completion · avg. payment 5 min'],
      ['0.923 EUR / USDT', '0.919 EUR / USDT'], ['Available', 'Buying up to'], ['12,480 USDT', '8,000 USDT'],
      ['You receive', 'You sell'], ['541.71', '500.00'], ['You pay 500.00 EUR', 'You receive ≈ 459.50 EUR'], ['Payment method', 'Get paid via']]],
    ['btn', 'Sell USDT', null, 'sell'],
    ['link', 'Sell USDT', 'G03s'], ['link', 'I receive', 'G02sr']] },
  { src: 'G02', code: 'G02sr', name: 'Sell to advertiser · receive', ops: [
    ['text', [['Buy USDT', 'Sell USDT'], ['Petra S.', 'Tomáš K.'], ['PS', 'TK'],
      ['1,284 orders · 99.2% completion · avg. release 6 min', '642 orders · 98.9% completion · avg. payment 5 min'],
      ['0.923 EUR / USDT', '0.919 EUR / USDT'], ['Available', 'Buying up to'], ['12,480 USDT', '8,000 USDT'],
      ['I pay', 'I sell'], ['You pay', 'You receive'], ['500.00', '459.50'], ['You receive ≈ 541.71 USDT', 'You sell ≈ 500.00 USDT'], ['Payment method', 'Get paid via'],
      ["Seller's terms: use the order number as the reference. Payments from third-party accounts are refunded.", "Buyer's terms: pays within 15 minutes from a bank account in their own name. Release only when the money is in your account."]]],
    ['btn', 'Sell USDT', null, 'sell'], ['link', 'Sell USDT', 'G03s'], ['link', 'I sell', 'G02s']] },  // segment swapped by hand, see G02s
  { src: 'G03w', code: 'G03s', name: 'P2P sell order · waiting for payment', ops: [
    ['text', [['Order G-4412', 'Order S-2087'], ['Waiting for the seller', "Waiting for the buyer's payment"],
      ['Petra has been notified. This seller usually releases USDT within 6 minutes.', 'Your 500.00 USDT is locked in escrow. Tomáš has 15 minutes to send 459.50 EUR to your bank account.'],
      ['30 Sep, 11:04', '1 Oct, 00:40'], ['You paid 500.00 EUR', '500.00 USDT locked in escrow'], ['30 Sep, 11:09', '1 Oct, 00:40'],
      ['Seller releases 541.71 USDT', 'Buyer pays 459.50 EUR'], ['Usually within 6 minutes', 'Within 15 minutes'], ['Chat with seller', 'Chat with buyer']]],
    ['link', 'Refresh status', 'G03p']] },
  { src: 'G03', code: 'G03p', name: 'P2P sell order · confirm payment', ops: [
    ['text', [['Order G-4412', 'Order S-2087'], ['Pay the seller within', 'Release within'], ['14:21', '09:12'],
      ['You pay', 'You sell'], ['500.00 EUR', '500.00 USDT'], ['0.923 EUR', '0.919 EUR'], ['541.71 USDT', '459.50 EUR'],
      ["Seller's payment details", "Buyer's payment"], ['Account holder', 'Paid from'], ['Petra Svobodová', 'Tomáš Kovář'],
      ['CZ98 3456 0000 0098 7654 3210', 'CZ65 0800 0000 1920 0014 5399'], ['G4412', 'S2087'],
      ['Pay only from a bank account in your own name, then tap "I have paid". Never mark an order as paid before sending the money.',
        'Open your bank app first. Release only when 459.50 EUR from Tomáš Kovář is in your account. Released crypto cannot be returned.'],
      ['I have paid', 'Payment received · release'], ['Cancel order', "I haven't received it"]]],
    ['link', 'Payment received · release', 'G03v'], ['link', "I haven't received it", 'R02']] },
  { src: 'G03c', code: 'G03v', name: 'Release crypto?', ops: [
    ['over', 'G03p'],
    ['text', [['Cancel this order?', 'Release 500.00 USDT?'],
      ["Only cancel if you haven't paid. Frequent cancellations can limit your P2P access for 24 hours.", 'Release only after you see 459.50 EUR from Tomáš Kovář in your own bank account. This cannot be undone.'],
      ["I haven't paid the seller", 'I have received the payment'], ['Keep order', 'Not yet']]],
    ['btn', 'Cancel order', 'Release USDT', 'primary'],
    ['link', 'Release USDT', 'G04s']] },
  { src: 'G04', code: 'G04s', name: 'P2P sell order completed', ops: [
    ['text', [['541.71 USDT has been added to your spot wallet.', '459.50 EUR is on its way to your bank account. You sold 500.00 USDT.'],
      ['G-4412', 'S-2087'], ['Paid', 'Sold'], ['500.00 EUR', '500.00 USDT'], ['Received', 'Received'], ['541.71 USDT', '459.50 EUR'],
      ['Seller', 'Buyer'], ['Petra S.', 'Tomáš K.'], ['Rate the seller', 'Rate the buyer']]]] },
];
const P2P_FAMILIES = [
  { group: SIDE, codes: { Buy: 'G01', Sell: 'G01s' } },
  { group: SIDE, codes: { Buy: 'G01b', Sell: 'G01sb' } },
  { group: SIDE, codes: { Buy: 'G01e', Sell: 'G01se' } },
  { group: SIDE, codes: { Buy: 'G01n', Sell: 'G01sn' } },
  { group: COINS, codes: { USDT: 'G01', BTC: 'G01b', ETH: 'G01e', NVXO: 'G01n' } },
  { group: COINS, codes: { USDT: 'G01s', BTC: 'G01sb', ETH: 'G01se', NVXO: 'G01sn' } },
];
const P2P_EXTRA = ['G02s', 'G03s', 'G03p', 'G03v', 'G04s'];

// ---------- Markets (D01): sort columns + categories ----------
const CATS = ['All', 'Layer 1', 'DeFi', 'Meme', 'NVXO'];
const MK_HDR = ['Name / Vol'];
const MARKETS = [
  { patch: 'D01', ops: [['link', 'Last price', 'D01p', 1], ['link', '24h chg', 'D01c', 1]] },
  { src: 'D01', code: 'D01p', name: 'Markets · by price', ops: [
    ['order', 'BTC/USDT', ['BTC/', 'ETH/', 'BNB/', 'SOL/', 'LINK/', 'NVXO/', 'XRP/', 'ADA/', 'DOGE/', 'TRX/']],
    ['link', 'Last price', 'D01', 1], ['fit']] },
  { src: 'D01', code: 'D01c', name: 'Markets · by 24h change', ops: [
    ['order', 'BTC/USDT', ['NVXO/', 'DOGE/', 'ADA/', 'BTC/', 'ETH/', 'LINK/', 'BNB/', 'TRX/', 'SOL/', 'XRP/']],
    ['link', '24h chg', 'D01', 1], ['fit']] },
  { src: 'D01', code: 'D01l', name: 'Markets · Layer 1', ops: [
    ['act', CATS, 'Layer 1'], ['keep', 'BTC/USDT', ['BTC/', 'ETH/', 'SOL/', 'BNB/', 'XRP/', 'ADA/', 'TRX/'], MK_HDR], ['fit']] },
  { src: 'D01', code: 'D01d', name: 'Markets · DeFi', ops: [
    ['act', CATS, 'DeFi'],
    ['dup', 'BTC/USDT', 'LINK/USDT', [['LINK', 'UNI'], ['Vol 19.8M', 'Vol 14.3M'], ['14.52', '7.842'], ['$14.52', '$7.84'], ['+1.12%', '+4.12%']], { from: 'SOL/', letter: 'U', color: '#FF007A' }],
    ['dup', 'BTC/USDT', 'LINK/USDT', [['LINK', 'AAVE'], ['Vol 19.8M', 'Vol 11.6M'], ['14.52', '162.90'], ['$14.52', '$162.90'], ['+1.12%', '-1.08%']], { from: 'SOL/', letter: 'A', color: '#B6509E' }],
    ['keep', 'BTC/USDT', ['LINK/', 'UNI/', 'AAVE/'], MK_HDR], ['pills'], ['fit']] },
  { src: 'D01', code: 'D01m', name: 'Markets · Meme', ops: [
    ['act', CATS, 'Meme'],
    ['dup', 'BTC/USDT', 'DOGE/USDT', [['DOGE', 'SHIB'], ['Vol 57.0M', 'Vol 31.4M'], ['0.1523', '0.00001742'], ['$0.15', '$0.000017'], ['+5.21%', '+2.64%']], { from: 'SOL/', letter: 'S', color: '#FFA409' }],
    ['dup', 'BTC/USDT', 'DOGE/USDT', [['DOGE', 'PEPE'], ['Vol 57.0M', 'Vol 26.8M'], ['0.1523', '0.00001102'], ['$0.15', '$0.000011'], ['+5.21%', '+7.84%']], { from: 'SOL/', letter: 'P', color: '#3D9A3A' }],
    ['keep', 'BTC/USDT', ['DOGE/', 'SHIB/', 'PEPE/'], MK_HDR], ['pills'], ['fit']] },
  { src: 'D01', code: 'D01x', name: 'Markets · NVXO', ops: [
    ['act', CATS, 'NVXO'], ['keep', 'BTC/USDT', ['NVXO/'], MK_HDR], ['fit']] },
];
// active sort column: arrow + full-strength label (applied after build, see SORTED)
const SORTED = { D01p: 'Last price', D01c: '24h chg' };
const MARKETS_FAMILIES = [
  { group: CATS, codes: { All: 'D01', 'Layer 1': 'D01l', DeFi: 'D01d', Meme: 'D01m', NVXO: 'D01x' }, also: ['D01p', 'D01c'] },
];

// ---------- Earn, positions, loans, address book ----------
const LOANS = ['Ongoing', 'Repaid', 'Liquidated', 'Reset']; // Reset stays a link to I05
const TERMS = ['All', '30 days', '60 days', '90 days'];
const EARN_HDR = ['Total in Earn', 'My positions', 'Rewards are variable'];
const REST = [
  { src: 'H01f', code: 'H01ft', name: 'Simple Earn · fixed · 30 days', ops: [['act', TERMS, '30 days'], ['keep', 'USDT · 30 days', ['· 30 days'], EARN_HDR], ['fit']] },
  { src: 'H01f', code: 'H01fs', name: 'Simple Earn · fixed · 60 days', ops: [['act', TERMS, '60 days'], ['keep', 'USDT · 30 days', ['· 60 days'], EARN_HDR], ['fit']] },
  { src: 'H01f', code: 'H01fn', name: 'Simple Earn · fixed · 90 days', ops: [['act', TERMS, '90 days'], ['keep', 'USDT · 30 days', ['· 90 days'], EARN_HDR], ['fit']] },
  { src: 'H05', code: 'H05f', name: 'My positions · flexible', ops: [['act', ['All (3)', 'Flexible', 'Fixed'], 'Flexible'], ['keep', 'USDT Flexible', ['USDT Flexible'], ['All (3)']]] },
  { src: 'H05', code: 'H05x', name: 'My positions · fixed', ops: [['act', ['All (3)', 'Flexible', 'Fixed'], 'Fixed'], ['keep', 'USDT Flexible', ['NVXO Fixed'], ['All (3)']]] },
  { src: 'I05', code: 'I05r', name: 'Loan orders · repaid', ops: [
    ['act', LOANS, 'Repaid'],
    ['text', [['1,000.00 USDT', '500.00 USDT'], ['Order 68db8dfb8b92', 'Order 51ac2e07d3f1'], ['Ongoing', 'Repaid', 1],
      ['Remaining principal', 'Repaid principal'], ['Accrued interest', 'Interest paid'], ['0.21 USDT', '0.73 USDT'],
      ['Collateral', 'Collateral returned'], ['0.02119 BTC', '0.01060 BTC'], ['Current LTV', 'Final LTV'], ['70.4%', '0%'],
      ['Safe', 'Closed'], ['Expires', 'Repaid on'], ['7 Oct 2026, 11:30', '24 Sep 2026, 09:12']]],
    ['removeText', 'Repay', 1], ['link', 'Reset', 'I05']] },
  { src: 'I05', code: 'I05l', name: 'Loan orders · liquidated', ops: [
    ['act', LOANS, 'Liquidated'],
    ['empty', 'Order 68db8dfb8b92', 'verified', 'No liquidated loans', 'Keep your LTV below 80% to avoid liquidation. We warn you by push and email at 75%.'],
    ['link', 'Reset', 'I05']] },
  { src: 'F11', code: 'F11t', name: 'Address book · USDT', ops: [['act', ['All', 'USDT', 'BTC', 'ETH'], 'USDT'], ['keep', '· USDT', ['· USDT'], ['Whitelist only']]] },
  { src: 'F11', code: 'F11c', name: 'Address book · BTC', ops: [['act', ['All', 'USDT', 'BTC', 'ETH'], 'BTC'], ['keep', '· USDT', ['· BTC'], ['Whitelist only']]] },
  { src: 'F11', code: 'F11e', name: 'Address book · ETH', ops: [['act', ['All', 'USDT', 'BTC', 'ETH'], 'ETH'], ['keep', '· USDT', ['· ETH'], ['Whitelist only']]] },
];
const REST_FAMILIES = [
  { group: TERMS, codes: { All: 'H01f', '30 days': 'H01ft', '60 days': 'H01fs', '90 days': 'H01fn' } },
  { group: ['All (3)', 'Flexible', 'Fixed'], codes: { 'All (3)': 'H05', Flexible: 'H05f', Fixed: 'H05x' } },
  { group: LOANS, codes: { Ongoing: 'I05', Repaid: 'I05r', Liquidated: 'I05l' } },
  { group: ['All', 'USDT', 'BTC', 'ETH'], codes: { All: 'F11', USDT: 'F11t', BTC: 'F11c', ETH: 'F11e' } },
];

// ---------- Pair picker (D06) and open orders (E06) ----------
const QUOTES = ['Favourites', 'USDT', 'EUR', 'BTC'];
const PICK = [
  { src: 'D06', code: 'D06f', name: 'Pair picker · favourites', ops: [['act', QUOTES, 'Favourites'], ['keep', 'BTC/USDT', ['ETH/', 'NVXO/']]] },
  { src: 'D06', code: 'D06e', name: 'Pair picker · EUR', ops: [['act', QUOTES, 'EUR'], ['keep', 'BTC/USDT', ['BTC/', 'ETH/', 'NVXO/', 'SOL/']],
    ['text', [['/USDT', '/EUR', null, 'sub'], ['67,412.50', '62,131.34'], ['$67,412.50', '€62,131.34'], ['+2.31%', '+2.28%'],
      ['3,452.18', '3,181.73'], ['$3,452.18', '€3,181.73'], ['+1.87%', '+1.85%'], ['6.2540', '5.7641'], ['$6.25', '€5.76'], ['+11.13%', '+11.09%'],
      ['162.35', '149.62'], ['$162.35', '€149.62'], ['-0.94%', '-0.88%']]]] },
  { src: 'D06', code: 'D06b', name: 'Pair picker · BTC', ops: [['act', QUOTES, 'BTC'], ['keep', 'BTC/USDT', ['ETH/', 'NVXO/', 'SOL/', 'BNB/']],
    ['text', [['/USDT', '/BTC', null, 'sub'], ['3,452.18', '0.051210'], ['+1.87%', '-0.43%'], ['6.2540', '0.00009277'], ['+11.13%', '+8.62%'],
      ['162.35', '0.002408'], ['-0.94%', '-3.18%'], ['598.40', '0.008877'], ['+0.62%', '-1.46%']]], ['pills']] },
];
const SIDES = ['All pairs', 'Buy', 'Sell', 'Limit', 'Stop-limit'];
const ORD_HDR = ['Cancel all open orders'];
const ORDERS = [
  { src: 'E06', code: 'E06b', name: 'Orders · open · buy', ops: [['act', SIDES, 'Buy'], ['keep', 'Buy BTC/USDT', ['Buy BTC/USDT'], ORD_HDR]] },
  { src: 'E06', code: 'E06s', name: 'Orders · open · sell', ops: [['act', SIDES, 'Sell'], ['keep', 'Buy BTC/USDT', ['Sell ETH/USDT'], ORD_HDR]] },
  { src: 'E06', code: 'E06l', name: 'Orders · open · limit', ops: [['act', SIDES, 'Limit']] },
  { src: 'E06', code: 'E06k', name: 'Orders · open · stop-limit', ops: [['act', SIDES, 'Stop-limit'],
    ['empty', 'Buy BTC/USDT', 'receipt_long', 'No stop-limit orders', 'Stop-limit orders you place appear here until they trigger or you cancel them.'],
    ['removeText', 'Cancel all open orders', 1]] },
];
const PICK_FAMILIES = [
  { group: QUOTES, codes: { Favourites: 'D06f', USDT: 'D06', EUR: 'D06e', BTC: 'D06b' } },
  { group: SIDES, codes: { 'All pairs': 'E06', Buy: 'E06b', Sell: 'E06s', Limit: 'E06l', 'Stop-limit': 'E06k' } },
];

const ALL_SPECS = [...P2P, ...MARKETS, ...REST, ...PICK, ...ORDERS];
const ALL_FAMILIES = [...P2P_FAMILIES, ...MARKETS_FAMILIES, ...REST_FAMILIES, ...PICK_FAMILIES];
if (typeof module !== 'undefined') module.exports = { P2P, P2P_FAMILIES, P2P_EXTRA, MARKETS, SORTED, MARKETS_FAMILIES, REST, REST_FAMILIES, PICK, ORDERS, PICK_FAMILIES, ALL_SPECS, ALL_FAMILIES };

// ---------- second sweep: home tabs, notifications (empty), order history range, chart timeframes ----------
const HOME_TABS = ['Hot pairs', 'Top gainers', 'New on NVXO'];
const letterRow = (name, chg, px, letter, color) => ['dup', '67,412.50', 'SOL', [['SOL', name], ['-0.94%', chg], ['162.35', px]], { from: 'SOL', letter, color }];
const homeTabs = src => [
  { src, code: src + 'g', name: (src === 'C01' ? 'Home' : 'Welcome') + ' · top gainers', ops: [
    ['act', HOME_TABS, 'Top gainers'],
    letterRow('DOGE', '+5.21%', '0.1523', 'D', '#C2A633'), letterRow('ADA', '+3.05%', '0.4412', 'A', '#0033AD'),
    ['keep', '67,412.50', ['NVXO', 'DOGE', 'ADA', 'BTC'], ['View all markets']], ['order', '67,412.50', ['NVXO', 'DOGE', 'ADA', 'BTC']], ['pills']] },
  { src, code: src + 'n', name: (src === 'C01' ? 'Home' : 'Welcome') + ' · new on NVXO', ops: [
    ['act', HOME_TABS, 'New on NVXO'],
    letterRow('TON', '+4.02%', '5.6210', 'T', '#0098EA'), letterRow('ARB', '-1.10%', '0.8120', 'A', '#28A0F0'),
    letterRow('PEPE', '+7.84%', '0.00001102', 'P', '#3D9A3A'), letterRow('AVAX', '+0.92%', '28.40', 'A', '#E84142'),
    ['keep', '67,412.50', ['TON', 'ARB', 'PEPE', 'AVAX'], ['View all markets']], ['pills']] },
];
const NOTIF = ['All', 'Trades', 'Wallet', 'System'];
const notif = (code, lab, title, sub) => ({ src: 'C03', code, name: 'Notifications · empty · ' + lab.toLowerCase(), ops: [
  ['act', NOTIF, lab], ['text', [["You're all caught up", title], ['Order fills, deposits and security alerts will appear here.', sub]]]] });
const RANGE = ['7 days', '30 days', '3 months', 'Custom'];
const SWEEP2 = [
  ...homeTabs('C01'), ...homeTabs('A05'),
  notif('C03t', 'Trades', 'No trade notifications', 'Order fills, cancellations and triggered price alerts will appear here.'),
  notif('C03w', 'Wallet', 'No wallet notifications', 'Deposits, withdrawals and transfers will appear here.'),
  notif('C03s', 'System', 'No system notifications', 'Security alerts, maintenance windows and product news will appear here.'),
  { src: 'E06h', code: 'E06hm', name: 'Orders · history · 30 days', ops: [['act', RANGE, '30 days']] },
  { src: 'E06h', code: 'E06hq', name: 'Orders · history · 3 months', ops: [['act', RANGE, '3 months'],
    ['dup', 'Buy BTC/USDT', 'Buy ETH/USDT', [['22 Sep, 12:48 · Stop-limit', '14 Aug, 09:30 · Limit'], ['3,390.00', '2,710.00'], ['0.2500', '0.5000']]],
    ['dup', 'Buy BTC/USDT', 'Sell SOL/USDT', [['27 Sep, 09:11 · Limit', '2 Jul, 17:45 · Limit'], ['170.00', '185.00'], ['1.00 SOL', '2.00 SOL']]], ['fit']] },
  // the 7-day view drops the 22 Sep order (built last so the variants above still carry it)
  { patch: 'E06h', ops: [['keep', 'Buy BTC/USDT', ['30 Sep', '28 Sep', '27 Sep']]] },
  // chart timeframes: candles, volume and axis are regenerated by chartFor() (see tools/figma-chart.js)
  { src: 'D04', code: 'D04q', name: 'Pair detail · chart · 15m', ops: [['act', ['15m', '1h', '4h', '1D', '1W'], '15m']] },
  { src: 'D04', code: 'D04o', name: 'Pair detail · chart · 1h', ops: [['act', ['15m', '1h', '4h', '1D', '1W'], '1h']] },
  { src: 'D04', code: 'D04f', name: 'Pair detail · chart · 4h', ops: [['act', ['15m', '1h', '4h', '1D', '1W'], '4h']] },
  { src: 'D04', code: 'D04w', name: 'Pair detail · chart · 1W', ops: [['act', ['15m', '1h', '4h', '1D', '1W'], '1W']] },
];
const CHART = { D04q: { top: 67560, step: 80, seed: 11 }, D04o: { top: 67800, step: 240, seed: 23 }, D04f: { top: 68200, step: 400, seed: 37 }, D04w: { top: 70000, step: 3000, seed: 53 } };
const SWEEP2_FAMILIES = [
  { group: HOME_TABS, codes: { 'Hot pairs': 'C01', 'Top gainers': 'C01g', 'New on NVXO': 'C01n' } },
  { group: HOME_TABS, codes: { 'Hot pairs': 'A05', 'Top gainers': 'A05g', 'New on NVXO': 'A05n' } },
  { group: NOTIF, codes: { All: 'C03', Trades: 'C03t', Wallet: 'C03w', System: 'C03s' } },
  { group: RANGE, codes: { '7 days': 'E06h', '30 days': 'E06hm', '3 months': 'E06hq' } },
  { group: ['15m', '1h', '4h', '1D', '1W'], codes: { '15m': 'D04q', '1h': 'D04o', '4h': 'D04f', '1D': 'D04', '1W': 'D04w' } },
];
if (typeof module !== 'undefined') Object.assign(module.exports, { SWEEP2, CHART, SWEEP2_FAMILIES });

// ---------- Simple Earn subscribe: duration changes APR, maturity and rewards ----------
const DUR = ['Flexible', '30 days', '90 days'];
const SUBSCRIBE = [
  { src: 'H03', code: 'H03t', name: 'Subscribe · 30 days', ops: [['act', DUR, '30 days'], ['text', [['Est. APR 12.00%', 'Est. APR 8.50%'], ['29 Dec 2026', '31 Oct 2026'], ['30 Dec 2026', '1 Nov 2026'], ['12.00%', '8.50%'], ['2.96 NVXO', '0.70 NVXO']]]] },
  { src: 'H03', code: 'H03x', name: 'Subscribe · flexible', ops: [['act', DUR, 'Flexible'], ['text', [['NVXO Fixed', 'NVXO Flexible'], ['Est. APR 12.00%', 'Est. APR 5.00%'], ['Maturity', 'Redeem'], ['29 Dec 2026', 'Anytime'], ['Paid to spot wallet', 'Rewards paid'], ['30 Dec 2026', 'Daily'], ['12.00%', '5.00%'], ['Est. rewards', 'Est. daily rewards'], ['2.96 NVXO', '0.014 NVXO'], ['Auto-resubscribe', 'Auto-compound']]]] },
];
const SUBSCRIBE_FAMILIES = [{ group: DUR, codes: { Flexible: 'H03x', '30 days': 'H03t', '90 days': 'H03' } }];
// Hand fixes applied after build (both themes): D01p/D01c active sort column (arrow_downward + full-strength label),
// I05/I05r header stack hug (order id no longer wraps), I05r "Closed" tag neutral, Light chart tags re-centred on the price line.
if (typeof module !== 'undefined') Object.assign(module.exports, { SUBSCRIBE, SUBSCRIBE_FAMILIES });
