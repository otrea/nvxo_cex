BL.timeline = function (p, items, o) {
  var c = o.bare ? AL('v', { gap: 0 }) : card({ gap: 0 });
  items.forEach(function (it, i) {
    var r = AL('h', { gap: 12, name: 'step ' + it[0] });
    var l = AL('v', { align: 'center', gap: 0 });
    var dn = it[2]; l.appendChild(circle(12, dn ? 'mint' : null, { stroke: dn ? null : 'mut', sw: 2 }));
    if (i < items.length - 1) l.appendChild(rect(2, 34, dn ? 'mint' : 'line'));
    r.appendChild(l);
    var tx = AL('v', { gap: 2 }); tx.appendChild(T(it[0], { s: 14, w: 'Medium', c: dn || it[2] == null ? 'fg' : 'sec' })); if (it[1]) tx.appendChild(T(it[1], { s: 12, c: 'mut' }));
    put(r, tx, 'fill');
    if (it[3]) r.appendChild(T(it[3], { s: 13, c: 'sec', align: 'right' }));
    put(c, r, 'fill');
  });
  put(p, c, 'fill');
};
BL.table = function (p, o) {
  var c = AL('v', { bg: 'card', r: 16, clip: true, name: 'table' });
  var ws = o.w || o.cols.map(function () { return 1; }), sum = ws.reduce(function (a, b) { return a + b; }, 0), iw = CW - 24;
  function tr(cells, head, hl) {
    var r = AL('h', { pad: [head ? 10 : 12, 12], bg: head ? 'card2' : (hl ? 'mint' : null), op: hl ? 0.1 : 1, align: 'center', name: head ? 'table head' : 'table row' });
    cells.forEach(function (x, i) {
      var cell = AL('h', { gap: 4, align: 'center', justify: i === cells.length - 1 && o.lastRight !== false ? 'end' : 'min' }); cell.resize(Math.floor(iw * ws[i] / sum), 18); cell.primaryAxisSizingMode = 'FIXED';
      if (typeof x === 'object' && x && x.medal) { cell.appendChild(I('emoji_events', { s: 18, c: x.medal })); }
      else { var t = T(String(x), { s: head ? 11 : 13, w: head ? 'Medium' : (i === 0 ? 'SemiBold' : 'Regular'), c: head ? 'mut' : (o.colors && o.colors[i]) || 'fg', mono: !head && o.mono && o.mono.indexOf(i) >= 0 }); cell.appendChild(t); if (t.width > cell.width) { t.textAutoResize = 'HEIGHT'; t.resize(cell.width, t.height); } }
      r.appendChild(cell);
    });
    return r;
  }
  put(c, tr(o.cols, true), 'fill');
  o.rows.forEach(function (rr, i) { if (i) { var l = line(); put(c, l, 'fill'); l.opacity = 0.5; } put(c, tr(rr, false, o.hl === i), 'fill'); });
  put(p, c, 'fill');
};
BL.upload = function (p, o) {
  if (o.done) {
    var d = AL('h', { bg: 'card', r: 14, pad: [12, 14], gap: 12, align: 'center', stroke: 'line', name: 'uploaded file' });
    d.appendChild(iconCircle(o.ic || 'description', { d: 40, s: 20 })); var tx = AL('v', { gap: 2 }); tx.appendChild(T(o.done, { s: 14, w: 'Medium' })); tx.appendChild(T(o.size || '1.2 MB · uploaded', { s: 12, c: 'mut' })); put(d, tx, 'fill'); d.appendChild(link(I('close', { s: 20, c: 'mut' }), 'self'));
    put(p, d, 'fill'); return;
  }
  var c = AL('v', { r: 14, stroke: 'mut', dash: true, gap: 6, align: 'center', justify: 'center', pad: [22, 16], name: 'upload' });
  c.appendChild(I(o.ic || 'cloud_upload', { s: 32, c: 'mint' })); put(c, T(o.t || 'Upload a file', { s: 14, w: 'Medium', align: 'center' }), 'fill'); put(c, T(o.s || 'JPG, PNG or PDF · max 5 MB', { s: 12, c: 'mut', align: 'center' }), 'fill');
  put(p, link(c, o.to || 'sheet'), 'fill');
};
BL.chat = function (p, msgs, o) {
  var c = AL('v', { gap: 12, name: 'conversation' });
  msgs.forEach(function (m) {
    if (m[0] === 'sys') { put(c, T(m[1], { s: 12, c: 'mut', align: 'center' }), 'fill'); return; }
    var me = m[0] === 'me', r = AL('h', { justify: me ? 'end' : 'min' });
    var b = AL('v', { bg: me ? 'mint' : 'card2', r: 16, pad: [10, 14], gap: 4 });
    var t = T(m[1], { s: 14, c: me ? 'onMint' : 'fg', lh: 19 }); b.appendChild(t); if (t.width > 250) { t.textAutoResize = 'HEIGHT'; t.resize(250, t.height); }
    b.appendChild(T(m[2] || '', { s: 10, c: me ? 'onMint' : 'mut', op: 0.7 }));
    r.appendChild(b); put(c, r, 'fill');
  });
  put(p, c, 'fill');
};
BL.pairhead = function (p, o) {
  var c = AL('v', { gap: 10, name: 'pair header' });
  var t = AL('h', { gap: 10, align: 'center' });
  if (o.menu !== false) t.appendChild(link(I('menu', { s: 24 }), o.mto || 'D06'));
  t.appendChild(link(T(o.pair, { s: 20, w: 'Bold' }), o.mto || 'D06'));
  t.appendChild(tag(o.chg, String(o.chg).charAt(0) === '-' ? 'neg' : 'pos'));
  var sp = rect(1, 1, null); put(t, sp, 'fill');
  (o.icons || []).forEach(function (x) { t.appendChild(link(I(x[0], { s: 22, c: x[2] || 'sec' }), x[1])); });
  put(c, t, 'fill');
  if (o.price) {
    var pr = AL('h', { gap: 16, align: 'min' });
    var l = AL('v', { gap: 2 }); l.appendChild(T(o.price, { s: 30, w: 'Bold', c: String(o.chg).charAt(0) === '-' ? 'neg' : 'pos', lh: 36 })); l.appendChild(T(o.sub || '', { s: 13, c: 'mut' })); put(pr, l, 'fill');
    if (o.stats) { var g = AL('v', { gap: 6 }); o.stats.forEach(function (s) { var rr = AL('h', { gap: 8, justify: 'between' }); rr.resize(150, 16); rr.primaryAxisSizingMode = 'FIXED'; rr.appendChild(T(s[0], { s: 11, c: 'mut' })); rr.appendChild(T(s[1], { s: 11, w: 'Medium', align: 'right' })); g.appendChild(rr); }); pr.appendChild(g); }
    put(c, pr, 'fill');
  }
  put(p, c, 'fill');
};
BL.stats = function (p, list, o) {
  var cols = o.cols || 2, g = o.bare ? AL('v', { gap: 14 }) : card({ gap: 14 });
  for (var i = 0; i < list.length; i += cols) { var r = AL('h', { gap: 12 }); for (var j = 0; j < cols; j++) { var x = list[i + j], cell = AL('v', { gap: 4 }); if (x) { cell.appendChild(T(x[0], { s: 12, c: 'mut' })); cell.appendChild(T(x[1], { s: x[3] || 15, w: 'SemiBold', c: x[2] || 'fg' })); } put(r, cell, 'fill'); } put(g, r, 'fill'); }
  put(p, g, 'fill');
};
BL.countdown = function (p, o) { var c = AL('v', { gap: 4, align: 'center' }); c.appendChild(T(o.l || '', { s: 13, c: 'mut' })); c.appendChild(T(o.v, { s: o.s || 48, w: 'Bold', mono: true, c: o.c || 'fg', lh: (o.s || 48) + 4 })); put(p, c, 'fill'); };
BL.doc = function (p, list, o) { var c = AL('v', { gap: 18 }); list.forEach(function (x) { var s = AL('v', { gap: 6 }); if (x[0]) put(s, T(x[0], { s: 16, w: 'SemiBold' }), 'fill'); put(s, T(x[1], { s: 14, c: 'sec', lh: 21 }), 'fill'); put(c, s, 'fill'); }); put(p, c, 'fill'); };
BL.profile = function (p, o) {
  var f = AL('h', { bg: o.bare ? null : 'card', r: 16, pad: o.bare ? 0 : 16, gap: 14, align: 'center', name: 'profile card' });
  var av = AL('h', { bg: 'mint', r: (o.d || 56) / 2, align: 'center', justify: 'center' }); av.resize(o.d || 56, o.d || 56); av.primaryAxisSizingMode = 'FIXED'; av.counterAxisSizingMode = 'FIXED'; av.appendChild(T(o.ini || 'JN', { s: 20, w: 'Bold', c: 'onMint' })); f.appendChild(av);
  var tx = AL('v', { gap: 4 }); tx.appendChild(T(o.t, { s: 18, w: 'SemiBold' }));
  if (o.s) { var sr = AL('h', { gap: 6, align: 'center' }); sr.appendChild(T(o.s, { s: 13, c: 'mut' })); if (o.copy) sr.appendChild(link(I('content_copy', { s: 14, c: 'mint' }), 'toast')); tx.appendChild(sr); }
  if (o.tags) { var tg = AL('h', { gap: 6 }); o.tags.forEach(function (x) { tg.appendChild(tag(x[0], x[1])); }); tx.appendChild(tg); }
  put(f, tx, 'fill');
  if (o.chev) f.appendChild(I('chevron_right', { s: 22, c: 'mut' }));
  put(p, link(f, o.to), 'fill');
};
BL.illus = function (p, o) {
  var h = o.h || 260, f = box(CW, h, { name: 'illustration', clip: true });
  var cx = CW / 2, cy = h / 2;
  [1, 0.72, 0.46].forEach(function (k, i) { var d = h * 0.9 * k; var c = circle(d, 'mint', { op: 0.05 + i * 0.05 }); c.strokes = [paint('mint', 0.25)]; c.strokeWeight = 1; f.appendChild(c); c.x = cx - d / 2; c.y = cy - d / 2; });
  var ic = iconCircle(o.ic || 'show_chart', { d: h * 0.34, s: Math.round(h * 0.17), bg: 'mint', c: 'onMint' }); f.appendChild(ic); ic.x = cx - ic.width / 2; ic.y = cy - ic.height / 2;
  (o.sat || []).forEach(function (s, i) { var a = [[-0.36, -0.28], [0.34, -0.2], [-0.3, 0.3], [0.36, 0.26]][i % 4]; var sc = iconCircle(s, { d: 48, s: 24, bg: 'card2' }); f.appendChild(sc); sc.x = cx + a[0] * CW - 24; sc.y = cy + a[1] * h - 24; });
  put(p, f, 'fill');
};
BL.amount = function (p, o) {
  var c = card({ gap: 10, name: 'amount input', stroke: o.focus ? 'mint' : null });
  var t = AL('h', { justify: 'between', align: 'center' }); t.appendChild(T(o.label || 'Amount', { s: 13, c: 'sec' })); if (o.avail) t.appendChild(T(o.avail, { s: 12, c: 'mut' })); put(c, t, 'fill');
  var r = AL('h', { gap: 10, align: 'center' });
  put(r, T(o.v || '0.00', { s: 30, w: 'SemiBold', c: o.v ? 'fg' : 'mut', lh: 36 }), 'fill');
  if (o.max !== false) r.appendChild(link(T('MAX', { s: 13, w: 'Bold', c: 'mint' }), 'self'));
  var u = AL('h', { gap: 6, align: 'center', bg: 'card2', r: 18, pad: [6, 10] }); if (o.unit) { u.appendChild(coin(o.unit, 22)); u.appendChild(T(o.unit, { s: 14, w: 'SemiBold' })); if (o.usel) u.appendChild(I('expand_more', { s: 18, c: 'mut' })); r.appendChild(link(u, o.uto)); }
  put(c, r, 'fill');
  if (o.s) put(c, T(o.s, { s: 12, c: o.sc || 'mut' }), 'fill');
  if (o.pcts) { var pr = AL('h', { gap: 8 }); ['25%', '50%', '75%', 'Max'].forEach(function (x, i) { var ch = AL('h', { bg: i === o.pcts - 1 ? 'mint' : 'card2', r: 8, align: 'center', justify: 'center' }); ch.resize(40, 30); ch.counterAxisSizingMode = 'FIXED'; ch.appendChild(T(x, { s: 12, w: 'SemiBold', c: i === o.pcts - 1 ? 'onMint' : 'sec' })); put(pr, ch, 'fill'); }); put(c, pr, 'fill'); }
  put(p, c, 'fill');
};
BL.check = function (p, t, o) { var f = AL('h', { gap: 10, align: 'min' }); f.appendChild(check(o.on !== false)); var tx = typeof t === 'string' ? T(t, { s: 13, c: 'sec', lh: 18 }) : R(t, { s: 13, c: 'sec', lh: 18 }); put(f, tx, 'fill'); put(p, link(f, o.to), 'fill'); };
BL.toggle = function (p, o) { var f = AL('h', { gap: 12, align: 'center', bg: o.bare ? null : 'card', r: 14, pad: o.bare ? 0 : [12, 14] }); var tx = AL('v', { gap: 2 }); var tr = AL('h', { gap: 4, align: 'center' }); tr.appendChild(T(o.t, { s: 14, w: 'Medium' })); if (o.info) tr.appendChild(link(I('info_outline', { s: 16, c: 'mut' }), o.info)); tx.appendChild(tr); if (o.s) put(tx, T(o.s, { s: 12, c: 'mut' }), 'fill'); put(f, tx, 'fill'); f.appendChild(toggle(o.on)); put(p, link(f, o.to), 'fill'); };
BL.card = function (p, list, o, ctx) { var c = card({ pad: o.pad, gap: o.gap, bg: o.bg, stroke: o.stroke, name: o.name }); blocks(c, list, Object.assign({}, ctx, { align: o.align })); put(p, link(c, o.to), 'fill'); };
BL.stack = function (p, list, o, ctx) { var c = AL('v', { gap: o.gap != null ? o.gap : 12, align: o.align === 'center' ? 'center' : 'min', pad: o.pad }); blocks(c, list, Object.assign({}, ctx, { align: o.align })); put(p, link(c, o.to), 'fill'); };
BL.row = function (p, list, o, ctx) { var r = AL('h', { gap: o.gap != null ? o.gap : 12, align: o.valign === 'center' ? 'center' : 'min' }); list.forEach(function (b) { var cell = AL('v', { gap: 8 }); put(r, cell, 'fill'); B(cell, b, ctx); }); put(p, r, 'fill'); };
BL.logo = function (p, o) { var c = COMP['logo / nvxo cex']; var w = AL('h', { justify: o.align === 'left' ? 'min' : 'center', name: 'logo' }); if (c) { var i = c.createInstance(); i.rescale((o.h || 52) / i.height); w.appendChild(i); } put(p, w, 'fill'); };
BL.orderbook = function (p, o) { put(p, orderbook(o), 'fill'); };
BL.trade = function (p, o) {
  var sell = o.side === 'sell', r = AL('h', { gap: 12, name: 'trade panel' });
  var L = AL('v', { gap: 10, name: 'order form' }); L.resize(206, 10); L.primaryAxisSizingMode = 'AUTO'; L.counterAxisSizingMode = 'FIXED';
  put(L, seg(['Buy', 'Sell'], sell ? 1 : 0, { h: 36, s: 14, colors: ['pos', 'neg'], to: [o.buyTo || 'E01', o.sellTo || 'E02'] }), 'fill');
  put(L, fieldBox({ lic: 'info_outline', value: o.type || 'Limit', hh: 40, sel: true, to: 'E03' }), 'fill');
  if (o.type === 'Stop-limit') put(L, fieldBox({ value: o.stop || '66,900.00', hh: 40, right: 'Stop', rc: 'mut' }), 'fill');
  if (o.type === 'Market') put(L, fieldBox({ value: 'Market price', hh: 40, bg: 'card2' }), 'fill');
  else { var pf = fieldBox({ value: o.price || '67,412.50', hh: 40 }); pf.appendChild(I('remove', { s: 18, c: 'sec' })); pf.appendChild(I('add', { s: 18, c: 'sec' })); put(L, pf, 'fill'); }
  put(L, fieldBox({ ph: o.amount ? null : 'Amount', value: o.amount || null, hh: 40, right: o.base || 'BTC', rc: 'mut' }), 'fill');
  BL.slider(L, { pct: o.pct || 0, labels: false, c: sell ? 'neg' : 'pos', w: 206 });
  put(L, fieldBox({ ph: o.total ? null : 'Total', value: o.total || null, hh: 40, right: o.quote || 'USDT', rc: 'mut' }), 'fill');
  var av = AL('h', { justify: 'between' }); av.appendChild(T('Available', { s: 11, c: 'mut' })); av.appendChild(T(sell ? (o.availB || '0.18420 BTC') : (o.availQ || '8,240.12 USDT'), { s: 11, w: 'Medium' })); put(L, av, 'fill');
  var ft = AL('h', { gap: 6, align: 'center' }); var ftt = T('Pay fees in NVXO', { s: 12, c: 'sec' }); put(ft, link(ftt, 'E14'), 'fill'); ft.appendChild(toggle(o.nvxo !== false)); put(L, ft, 'fill');
  put(L, button((sell ? 'Sell ' : 'Buy ') + (o.base || 'BTC'), sell ? 'sell' : 'buy', { small: true, to: o.submit || 'E04' }), 'fill');
  var fr = AL('h', { gap: 4, align: 'center' }); fr.appendChild(T('Trading fee 0.10% · VIP 1', { s: 11, c: 'mut' })); fr.appendChild(I('info_outline', { s: 14, c: 'mut' })); put(L, link(fr, 'E13'), 'fill');
  r.appendChild(L);
  var ob = orderbook({ rows: 8, mid: o.mid, base: o.base || 'BTC', compact: true }); put(r, ob, 'fill');
  put(p, r, 'fill');
};
function orderbook(o) {
  var n = o.rows || 8, c = AL('v', { gap: 3, name: 'order book' }), rnd = seeded(o.seed || 4), base = o.base || 'BTC';
  var hd = AL('h', { justify: 'between' }); hd.appendChild(T('Price (USDT)', { s: 11, c: 'mut' })); hd.appendChild(T('Amount (' + base + ')', { s: 11, c: 'mut', align: 'right' })); put(c, hd, 'fill');
  var mid = o.midv || 67412.5;
  function r2(price, amt, side) {
    var f = AL('h', { justify: 'between', name: side + ' ' + price, pad: [2, 0] });
    var bar = rect(40 + rnd() * 90, 20, side === 'ask' ? 'neg' : 'pos'); bar.opacity = 0.12; f.appendChild(bar); bar.layoutPositioning = 'ABSOLUTE'; bar.constraints = { horizontal: 'MAX', vertical: 'MIN' };
    f.appendChild(link(T(price, { s: 12, mono: true, c: side === 'ask' ? 'neg' : 'pos' }), 'self')); f.appendChild(T(amt, { s: 12, mono: true, c: 'sec', align: 'right' }));
    return f;
  }
  var fmt = function (v) { var s = v.toFixed(1).split('.'); return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + s[1]; };
  var rowsA = [];
  for (var i = n; i >= 1; i--) rowsA.push(r2(fmt(mid + i * 0.5 + (i > 4 ? i : 0)), (rnd() * 0.9 + 0.001).toFixed(4), 'ask'));
  rowsA.forEach(function (x) { put(c, x, 'fill'); });
  var m = AL('v', { gap: 0, pad: [6, 0], name: 'mid price' }); m.appendChild(T(o.mid || '67,412.50', { s: 17, w: 'Bold', c: 'pos' })); m.appendChild(T('≈ $67,412.50', { s: 11, c: 'mut' })); put(c, m, 'fill');
  for (var j = 1; j <= n; j++) put(c, r2(fmt(mid - j * 0.5 - (j > 4 ? j : 0)), (rnd() * 0.9 + 0.001).toFixed(4), 'bid'), 'fill');
  c.children.forEach(function (ch) { if (ch.name.indexOf('ask') === 0 || ch.name.indexOf('bid') === 0) { var b = ch.children[0]; b.x = ch.width - b.width; b.y = 0; } });
  return c;
}

