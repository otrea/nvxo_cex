// Flow-gap screens added 1 Oct 2026 (audit v2). Built with the stored builder library (nvxo/lib_1..6).
// Z10 date picker (calendar icons on F21, O03, Q02), E15 pair menu (⋯ on E01, E02, E08),
// E16 create price alert, E17 price alerts.
var LIB = [1, 2, 3, 4, 5, 6].map(function (i) { return figma.root.getSharedPluginData('nvxo', 'lib_' + i); }).join('');
var AF = Object.getPrototypeOf(async function () {}).constructor;
var L = await new AF('figma', LIB)(figma);
await L.init('dark');

// calendar block: month header + weekday row + 5-week grid, selected day as a solid mint circle
L.BL.cal = function (p, o) {
  var P = L.P();
  var wrap = L.AL('v', { gap: 10, name: 'calendar' });
  var hd = L.AL('h', { justify: 'between', align: 'center', name: 'month' });
  var prev = L.AL('h', { bg: 'card2', r: 16, align: 'center', justify: 'center', name: 'prev month → self' }); prev.resize(32, 32); prev.primaryAxisSizingMode = 'FIXED'; prev.counterAxisSizingMode = 'FIXED';
  prev.appendChild(L.I('chevron_left', { s: 20, c: 'fg' })); prev.setSharedPluginData('nvxo', 'to', 'self');
  var next = L.AL('h', { bg: 'card2', r: 16, align: 'center', justify: 'center', name: 'next month → self' }); next.resize(32, 32); next.primaryAxisSizingMode = 'FIXED'; next.counterAxisSizingMode = 'FIXED';
  next.appendChild(L.I('chevron_right', { s: 20, c: 'fg' })); next.setSharedPluginData('nvxo', 'to', 'self');
  hd.appendChild(prev); hd.appendChild(L.T(o.month, { s: 16, w: 'SemiBold' })); hd.appendChild(next);
  L.put(wrap, hd, 'fill');
  var wd = L.AL('h', { justify: 'between', name: 'weekdays' });
  ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) { var c = L.AL('h', { justify: 'center' }); c.resize(40, 18); c.primaryAxisSizingMode = 'FIXED'; c.appendChild(L.T(d, { s: 12, w: 'Medium', c: 'mut' })); wd.appendChild(c); });
  L.put(wrap, wd, 'fill');
  var day = 1 - o.first; // o.first = weekday index of the 1st (Mon = 0)
  for (var w = 0; w < 5; w++) {
    var r = L.AL('h', { justify: 'between', name: 'week' });
    for (var k = 0; k < 7; k++, day++) {
      var inMonth = day >= 1 && day <= o.days;
      var sel = day === o.sel, inRange = o.from && day >= o.from && day <= o.sel;
      var c = L.AL('h', { r: 20, align: 'center', justify: 'center', bg: sel ? 'mint' : (inRange && inMonth ? 'card2' : null), name: inMonth ? 'day ' + day + ' → self' : 'day' });
      c.resize(40, 40); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED';
      if (inMonth) { c.appendChild(L.T(String(day), { s: 15, w: sel ? 'Bold' : 'Medium', c: sel ? 'onMint' : (day > o.max ? 'mut' : 'fg') })); c.setSharedPluginData('nvxo', 'to', 'self'); }
      r.appendChild(c);
    }
    L.put(wrap, r, 'fill');
  }
  L.put(p, wrap, 'fill');
};

var specs = [
  { id: 'Z10', name: 'Choose date', head: null, blocks: [], sheet: { over: 'F21', title: 'Choose date', blocks: [
    ['cal', { month: 'September 2026', first: 1, days: 30, sel: 30, max: 30 }],
    ['small', 'Dates are shown in your local time (CET).'] ],
    foot: [['Apply', 'primary', 'back'], ['Clear', 'ghost', 'back']] } },
  { id: 'E15', name: 'Pair menu', head: null, blocks: [], sheet: { over: 'E01', title: 'BTC/USDT', blocks: [
    ['list', [
      { ic: 'notifications_active', t: 'Price alert', s: 'Get notified when BTC reaches your price', chev: true, to: 'E16' },
      { ic: 'show_chart', t: 'Full chart', s: 'Candles, depth and indicators', chev: true, to: 'D04' },
      { ic: 'info_outline', t: 'About Bitcoin', s: 'Market cap, supply and links', chev: true, to: 'D05' },
      { ic: 'percent', t: 'Trading fees', s: 'Maker 0.10% · Taker 0.10% · VIP 1', chev: true, to: 'E13' },
      { ic: 'star_border', t: 'Add to favourites', to: 'toast' },
      { ic: 'ios_share', t: 'Share pair', to: 'toast' } ], {}] ] } },
  { id: 'E16', name: 'Create price alert', head: { t: 'Price alert' }, blocks: [
    ['pairhead', { pair: 'BTC/USDT', chg: '+2.31%', menu: false, price: '67,412.50', sub: 'Current price · ≈ €62,131.34' }],
    ['seg', ['Price rises to', 'Price drops to'], { a: 0, s: 14, to: [null, 'self'] }],
    ['amount', { label: 'Target price', v: '70,000.00', unit: 'USDT', max: false, s: '+3.84% from the current price' }],
    ['chips', ['+2%', '+5%', '+10%', '+20%'], { a: 1, to: ['self', null, 'self', 'self'] }],
    ['label', 'Notify me by'],
    ['toggle', { t: 'Push notification', s: 'On this phone', on: true, to: 'self' }],
    ['toggle', { t: 'Email', s: 'jan.n•••@email.cz', on: false, to: 'self' }],
    ['notice', 'Alerts fire once and expire after 90 days. Prices move fast — an alert is not an order.', { k: 'info' }] ],
    foot: [['Create alert', 'primary', 'E17']] },
  { id: 'E17', name: 'Price alerts', head: { t: 'Price alerts', right: [['add', 'E16']] }, blocks: [
    ['tabs', ['Active (2)', 'Triggered'], { a: 0, to: [null, 'self'] }],
    ['list', [
      { coin: 'BTC', t: 'BTC/USDT rises to', s: 'Created today · Push', r: '70,000.00', r2: '+3.84%', toggle: true, to: 'E16' },
      { coin: 'ETH', t: 'ETH/USDT drops to', s: 'Created 28 Sep · Push, email', r: '3,200.00', r2: '−7.33%', toggle: true, to: 'E16' } ], {}],
    ['small', 'You can have up to 20 active alerts.', { align: 'center' }] ],
    foot: [['New alert', 'primary', 'E16']] }
];
var res = await L.build('E', 'Spot trading', specs.filter(function (s) { return s.id.charAt(0) === 'E'; }));
var res2 = await L.build('Z', 'System states', specs.filter(function (s) { return s.id.charAt(0) === 'Z'; }));
return { E: res, Z: res2 };
