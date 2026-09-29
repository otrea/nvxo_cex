// ---------- building blocks ----------
function button(label, kind, o) {
  o = o || {}; kind = kind || 'primary';
  var h = o.small ? 40 : 52;
  var bg = { primary: 'mint', secondary: 'card2', outline: null, danger: 'neg', ghost: null, link: null, buy: 'pos', sell: 'neg', dark: 'card' }[kind];
  var fg = { primary: 'onMint', secondary: 'fg', outline: 'fg', danger: 'white', ghost: 'mint', link: 'mint', buy: 'onMint', sell: 'white', dark: 'fg' }[kind];
  var f = AL('h', { name: 'button/' + kind + ' ' + label, bg: bg, r: o.r || (o.small ? 10 : 14), align: 'center', justify: 'center', gap: 8, pad: [0, o.small ? 14 : 20], stroke: kind === 'outline' ? 'line' : null });
  f.resize(o.w || 120, h); f.counterAxisSizingMode = 'FIXED';
  if (o.icon) f.appendChild(I(o.icon, { s: o.small ? 18 : 20, c: fg }));
  f.appendChild(T(label, { s: o.small ? 14 : 16, w: 'SemiBold', c: fg }));
  if (o.disabled) f.opacity = 0.4;
  return link(f, o.to);
}
function fieldBox(o) {
  o = o || {};
  var f = AL('h', { name: 'input', bg: o.bg || 'card', r: 12, stroke: o.error ? 'neg' : (o.focus ? 'mint' : 'line'), align: o.h ? 'min' : 'center', gap: 10, pad: [o.h ? 14 : 0, 14] });
  f.resize(100, o.h || o.hh || 52); f.counterAxisSizingMode = 'FIXED';
  if (o.lic) f.appendChild(I(o.lic, { s: 20, c: 'mut' }));
  if (o.coin) f.appendChild(coin(o.coin, 24));
  if (o.prefix) { var pf = AL('h', { gap: 6, align: 'center', name: 'prefix' }); pf.appendChild(T(o.prefix, { s: 15, w: 'Medium' })); pf.appendChild(I('expand_more', { s: 18, c: 'mut' })); f.appendChild(pf); f.appendChild(rect(1, 24, 'line')); }
  var val = T(o.value != null ? o.value : (o.ph || ''), { s: 15, c: o.value != null ? 'fg' : 'mut', mono: o.mono, w: o.vw });
  put(f, val, 'fill');
  if (o.right) {
    var r = o.right;
    if (typeof r === 'string' && r.indexOf('icon:') === 0) f.appendChild(link(I(r.slice(5), { s: 22, c: o.rc || 'mut' }), o.rto));
    else if (typeof r === 'string') f.appendChild(link(T(r, { s: 14, w: 'SemiBold', c: o.rc || 'mint' }), o.rto));
    else if (r.btn) f.appendChild(button(r.btn, 'primary', { small: true, w: 96, to: r.to }));
  }
  if (o.sel) f.appendChild(I('expand_more', { s: 22, c: 'mut' }));
  return link(f, o.to);
}
function field(parent, o) {
  var s = AL('v', { gap: 8, name: 'field ' + (o.label || '') });
  if (o.label || o.lr) {
    var lr = AL('h', { justify: 'between', align: 'center', name: 'label-row' });
    lr.appendChild(T(o.label || '', { s: 13, w: 'Medium', c: 'sec' }));
    if (o.lr) lr.appendChild(link(T(o.lr, { s: 13, w: 'Medium', c: o.lrc || 'mint' }), o.lrto));
    put(s, lr, 'fill');
  }
  put(s, fieldBox(o), 'fill');
  if (o.error) put(s, T(o.error, { s: 12, c: 'neg' }), 'fill');
  if (o.hint) put(s, T(o.hint, { s: 12, c: 'mut' }), 'fill');
  put(parent, s, 'fill');
  return s;
}
function seg(items, a, o) {
  o = o || {};
  var f = AL('h', { name: 'segmented', bg: o.bg || 'card2', r: 12, pad: 4, gap: 4 });
  items.forEach(function (it, i) {
    var on = i === (a || 0);
    var cb = on ? (o.colors ? o.colors[i] : 'mint') : null;
    var c = AL('h', { bg: cb, r: 9, align: 'center', justify: 'center', name: 'seg ' + it });
    c.resize(50, o.h || 40); c.counterAxisSizingMode = 'FIXED';
    c.appendChild(T(it, { s: o.s || 15, w: on ? 'SemiBold' : 'Medium', c: on ? (o.colors && o.colors[i] === 'neg' ? 'white' : 'onMint') : 'sec' }));
    put(f, link(c, o.to && o.to[i]), 'fill');
  });
  return f;
}
function tabs(items, a, o) {
  o = o || {};
  var f = AL('h', { name: 'tabs', gap: o.gap || 22, clip: true, align: 'min' });
  items.forEach(function (it, i) {
    var on = i === (a || 0);
    var c = AL('v', { gap: 8, align: 'center', name: 'tab ' + it });
    c.appendChild(T(it, { s: o.s || 15, w: on ? 'SemiBold' : 'Medium', c: on ? 'fg' : 'mut' }));
    c.appendChild(rect(on ? 22 : 1, 3, on ? 'mint' : null, { r: 2 }));
    f.appendChild(link(c, o.to && o.to[i]));
  });
  return f;
}
function chips(items, a, o) {
  o = o || {};
  var f = AL('h', { name: 'chips', gap: 8, clip: true });
  items.forEach(function (it, i) {
    var on = Array.isArray(a) ? a.indexOf(i) >= 0 : i === a;
    var c = AL('h', { bg: on ? (o.on || 'mint') : 'card2', r: o.r || 17, align: 'center', gap: 6, pad: [0, 14], stroke: on ? null : null });
    c.resize(40, o.h || 34); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
    if (o.icons && o.icons[i]) c.appendChild(I(o.icons[i], { s: 16, c: on ? 'onMint' : 'sec' }));
    c.appendChild(T(it, { s: 13, w: on ? 'SemiBold' : 'Medium', c: on ? 'onMint' : 'sec' }));
    f.appendChild(link(c, o.to && o.to[i]));
  });
  return f;
}
function tag(t, c, o) { o = o || {}; var f = AL('h', { bg: c || 'mint', op: o.solid ? 1 : 0.16, r: 6, pad: [3, 8], name: 'tag ' + t }); f.appendChild(T(t, { s: 11, w: 'SemiBold', c: o.solid ? 'onMint' : (c || 'mint') })); return f; }
function chgPill(v, o) {
  o = o || {}; var up = String(v).charAt(0) !== '-';
  var f = AL('h', { bg: up ? 'pos' : 'neg', r: 8, align: 'center', justify: 'center', name: 'change ' + v });
  f.resize(o.w || 84, o.h || 34); f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.appendChild(T(v, { s: 13, w: 'SemiBold', c: up ? 'onMint' : 'white' })); return f;
}
function row(o) {
  // list row
  var f = AL('h', { name: 'row ' + (o.t || ''), gap: 12, align: 'center', pad: [o.py != null ? o.py : 14, 16] });
  if (o.ic) f.appendChild(iconCircle(o.ic, { c: o.danger ? 'neg' : (o.icc || 'mint'), d: o.d || 40 }));
  if (o.coin) f.appendChild(coin(o.coin, o.d || 36));
  if (o.av) { var av = AL('h', { bg: o.avc || 'mint', r: 20, align: 'center', justify: 'center' }); av.resize(40, 40); av.primaryAxisSizingMode = 'FIXED'; av.counterAxisSizingMode = 'FIXED'; av.appendChild(T(o.av, { s: 15, w: 'Bold', c: 'onMint' })); f.appendChild(av); }
  if (o.radio != null) f.appendChild(radio(o.radio));
  if (o.check != null) f.appendChild(check(o.check));
  var mid = AL('v', { gap: 2, name: 'text' });
  var tr = AL('h', { gap: 6, align: 'center' });
  tr.appendChild(T(o.t, { s: o.ts || 15, w: 'Medium', c: o.danger ? 'neg' : 'fg' }));
  if (o.badge) tr.appendChild(tag(o.badge[0], o.badge[1]));
  mid.appendChild(tr);
  if (o.s) put(mid, T(o.s, { s: 13, c: o.sc || 'mut' }), 'fill');
  put(f, mid, 'fill');
  if (o.r != null || o.r2 != null) {
    var rt = AL('v', { gap: 2, align: 'end', name: 'right' });
    if (o.r != null) rt.appendChild(T(o.r, { s: 15, w: 'SemiBold', c: o.rc || 'fg', align: 'right' }));
    if (o.r2 != null) rt.appendChild(T(o.r2, { s: 12, c: o.r2c || 'mut', align: 'right' }));
    f.appendChild(rt);
  }
  if (o.pill) f.appendChild(chgPill(o.pill, { w: 76, h: 30 }));
  if (o.btn) f.appendChild(button(o.btn, o.btnk || 'primary', { small: true, w: 90, to: o.bto }));
  if (o.toggle != null) f.appendChild(toggle(o.toggle));
  if (o.sel) f.appendChild(I(o.sel === 1 ? 'check_circle' : 'radio_button_unchecked', { s: 22, c: o.sel === 1 ? 'mint' : 'mut' }));
  if (o.chev) f.appendChild(I('chevron_right', { s: 22, c: 'mut' }));
  if (o.ric) f.appendChild(I(o.ric, { s: 20, c: o.ricc || 'mut' }));
  return link(f, o.to);
}
function card(o) { o = o || {}; return AL('v', { name: o.name || 'card', bg: o.bg || 'card', r: o.r || 16, pad: o.pad != null ? o.pad : 16, gap: o.gap != null ? o.gap : 12, stroke: o.stroke }); }
function line() { var r = rect(10, 1, 'line', { name: 'divider' }); return r; }

// ---------- block renderer ----------
var BL = {};
function B(parent, b, ctx) {
  var type = b[0], fn = BL[type];
  if (!fn) { ERRORS.push('unknown block ' + type); return; }
  try { fn(parent, b[1], b[2] || {}, ctx || {}); } catch (e) { ERRORS.push(type + ': ' + e.message); }
}
function blocks(parent, list, ctx) { (list || []).forEach(function (b) { if (b) B(parent, b, ctx); }); }

BL.h = function (p, t, o, ctx) { put(p, T(t, { s: o.s || 26, w: o.w || 'Bold', c: o.c, align: o.align || ctx.align, lh: o.lh || Math.round((o.s || 26) * 1.2) }), 'fill'); };
BL.p = function (p, t, o, ctx) { put(p, T(t, { s: o.s || 15, c: o.c || 'sec', align: o.align || ctx.align, w: o.w }), 'fill'); };
BL.small = function (p, t, o, ctx) { put(p, T(t, { s: o.s || 12, c: o.c || 'mut', align: o.align || ctx.align, w: o.w }), 'fill'); };
BL.rich = function (p, parts, o, ctx) { var t = R(parts, { s: o.s || 15, c: o.c || 'sec', align: o.align || ctx.align, w: o.w }); put(p, link(t, o.to), 'fill'); };
BL.sp = function (p, n) { var r = rect(10, n || 8, null, { name: 'spacer' }); put(p, r, 'fill'); };
BL.div = function (p) { put(p, line(), 'fill'); };
BL.label = function (p, t, o) {
  var f = AL('h', { justify: 'between', align: 'center', name: 'section ' + t });
  f.appendChild(T(t, { s: o.s || 18, w: 'SemiBold' }));
  if (o.right) f.appendChild(link(T(o.right, { s: 14, w: 'SemiBold', c: o.rc || 'mint' }), o.to));
  if (o.ric) f.appendChild(link(I(o.ric, { s: 22, c: 'mut' }), o.to));
  put(p, f, 'fill');
};
BL.link = function (p, t, o, ctx) { var f = AL('h', { justify: (o.align || ctx.align) === 'center' ? 'center' : 'min', gap: 4, align: 'center', name: 'link ' + t }); f.appendChild(T(t, { s: o.s || 15, w: 'SemiBold', c: o.c || 'mint' })); if (o.ic) f.appendChild(I(o.ic, { s: 18, c: o.c || 'mint' })); put(p, link(f, o.to), 'fill'); };
BL.btn = function (p, label, o) { put(p, button(label, o.k, o), 'fill'); };
BL.btns = function (p, list, o) { var f = AL('h', { gap: o.gap || 12, name: 'buttons' }); list.forEach(function (x) { put(f, button(x[0], x[1], { to: x[2], small: o.small, icon: x[3] }), 'fill'); }); put(p, f, 'fill'); };
BL.field = function (p, o) { field(p, o); };
BL.row2 = function (p, a, o) { var f = AL('h', { gap: 12, name: 'fields' }); a.forEach(function (x) { var c = AL('v', {}); put(f, c, 'fill'); field(c, x); }); put(p, f, 'fill'); };
BL.search = function (p, ph, o) { put(p, fieldBox({ lic: 'search', ph: ph, hh: o.h || 46, to: o.to, right: o.right, bg: 'card' }), 'fill'); };
BL.seg = function (p, items, o) { put(p, seg(items, o.a, o), 'fill'); };
BL.tabs = function (p, items, o) { var w = AL('v', { gap: 0, name: 'tabs-wrap' }); put(w, tabs(items, o.a, o), 'fill'); if (!o.noline) { var l = line(); put(w, l, 'fill'); l.opacity = 0.7; } put(p, w, 'fill'); };
BL.chips = function (p, items, o) { put(p, chips(items, o.a, o), 'fill'); };
BL.tags = function (p, items, o) { var f = AL('h', { gap: 8, justify: o.align === 'center' ? 'center' : 'min' }); items.forEach(function (x) { f.appendChild(tag(x[0], x[1], { solid: x[2] })); }); put(p, f, 'fill'); };
BL.list = function (p, rows, o) {
  var wrap = AL('v', { gap: 10, name: 'list ' + (o.title || '') });
  if (o.title) put(wrap, T(o.title, { s: 13, w: 'Medium', c: 'mut', upper: !!o.upper }), 'fill');
  var c = AL('v', { bg: o.bare ? null : 'card', r: 16, clip: true, name: 'list-card' });
  rows.forEach(function (r, i) {
    if (i && !o.nodiv) { var l = line(); put(c, l, 'fill'); l.opacity = 0.6; }
    var rr = row(Object.assign({ py: o.py, d: o.d }, r)); if (o.bare) { rr.paddingLeft = 0; rr.paddingRight = 0; }
    put(c, rr, 'fill');
  });
  put(wrap, c, 'fill'); put(p, wrap, 'fill');
};
BL.kv = function (p, rows, o) {
  var c = o.bare ? AL('v', { gap: o.gap || 12, name: 'details' }) : card({ gap: o.gap || 12, name: 'details' });
  if (o.title) put(c, T(o.title, { s: 15, w: 'SemiBold' }), 'fill');
  rows.forEach(function (r) {
    if (r === '-') { put(c, line(), 'fill'); return; }
    var f = AL('h', { justify: 'between', align: 'min', gap: 16, name: 'kv ' + r[0] });
    var k = AL('h', { gap: 4, align: 'center' }); k.appendChild(T(r[0], { s: 14, c: 'mut' })); if (r[3] && r[3].info) k.appendChild(I('info_outline', { s: 15, c: 'mut' }));
    f.appendChild(k);
    var vr = AL('h', { gap: 6, align: 'center' });
    var v = T(r[1], { s: 14, w: (r[3] && r[3].w) || 'Medium', c: r[2] || 'fg', align: 'right', mono: r[3] && r[3].mono });
    vr.appendChild(v);
    if (r[3] && r[3].copy) vr.appendChild(link(I('content_copy', { s: 16, c: 'mint' }), 'toast'));
    if (r[3] && r[3].tag) vr.appendChild(tag(r[3].tag[0], r[3].tag[1]));
    f.appendChild(vr);
    if (v.width > 200) { v.textAutoResize = 'HEIGHT'; v.resize(200, v.height); }
    put(c, f, 'fill');
  });
  put(p, c, 'fill');
};
BL.coins = function (p, rows, o) {
  var wrap = AL('v', { gap: 0, name: 'market list' });
  if (o.head !== false) {
    var hd = AL('h', { gap: 8, align: 'center', pad: [0, 0, 8, 0], name: 'header' });
    var h1 = AL('h', { gap: 2, align: 'center' }); h1.appendChild(T((o.head || [])[0] || 'Name / Vol', { s: 12, c: 'mut' })); h1.appendChild(I('unfold_more', { s: 14, c: 'mut' })); put(hd, h1, 'fill');
    var h2 = AL('h', { gap: 2, align: 'center' }); h2.appendChild(T((o.head || [])[1] || 'Last price', { s: 12, c: 'mut' })); h2.appendChild(I('unfold_more', { s: 14, c: 'mut' })); hd.appendChild(h2);
    var h3 = AL('h', { gap: 2, align: 'center', justify: 'end' }); h3.resize(84, 16); h3.primaryAxisSizingMode = 'FIXED'; h3.appendChild(T((o.head || [])[2] || '24h chg', { s: 12, c: 'mut' })); h3.appendChild(I('unfold_more', { s: 14, c: 'mut' })); hd.appendChild(h3);
    put(wrap, hd, 'fill');
  }
  rows.forEach(function (r) {
    var f = AL('h', { gap: 10, align: 'center', pad: [11, 0], name: 'pair ' + r.sym });
    if (o.star) f.appendChild(I(r.fav ? 'star' : 'star_outline', { s: 18, c: r.fav ? 'gold' : 'mut' }));
    f.appendChild(coin(r.sym, 32));
    var l = AL('v', { gap: 2 });
    l.appendChild(R([[r.sym, { w: 'SemiBold', c: 'fg' }], ['/' + (r.q || 'USDT'), { c: 'mut', s: 13 }]], { s: 15 }));
    l.appendChild(T(r.vol || '', { s: 12, c: 'mut' }));
    put(f, l, 'fill');
    var m = AL('v', { gap: 2, align: 'end' }); m.appendChild(T(r.p, { s: 15, w: 'SemiBold', align: 'right' })); m.appendChild(T(r.ps || '', { s: 12, c: 'mut', align: 'right' })); f.appendChild(m);
    f.appendChild(chgPill(r.chg));
    put(wrap, link(f, r.to || o.to), 'fill');
  });
  put(p, wrap, 'fill');
};
BL.tiles = function (p, list, o) {
  var g = AL('v', { gap: 12, name: 'pair tiles' });
  for (var i = 0; i < list.length; i += 2) {
    var r = AL('h', { gap: 12 });
    [list[i], list[i + 1]].forEach(function (x, j) {
      if (!x) return;
      var c = card({ gap: 10, pad: 14, name: 'tile ' + x.sym });
      var top = AL('h', { gap: 8, align: 'center' }); top.appendChild(coin(x.sym, 26)); var nm = T(x.sym, { s: 15, w: 'SemiBold' }); put(top, nm, 'fill'); top.appendChild(T(x.chg, { s: 12, w: 'SemiBold', c: String(x.chg).charAt(0) === '-' ? 'neg' : 'pos' })); put(c, top, 'fill');
      put(c, T(x.p, { s: 18, w: 'SemiBold' }), 'fill');
      c.appendChild(spark(137, 26, String(x.chg).charAt(0) !== '-', i * 3 + j + 5));
      put(r, link(c, x.to || o.to), 'fill');
    });
    put(g, r, 'fill');
  }
  put(p, g, 'fill');
};
BL.actions = function (p, list, o) {
  var cols = o.cols || 4, g = AL('v', { gap: o.gap || 18, name: 'actions' });
  for (var i = 0; i < list.length; i += cols) {
    var r = AL('h', { gap: 8 });
    for (var j = 0; j < cols; j++) {
      var x = list[i + j], it = AL('v', { gap: 8, align: 'center', name: x ? 'action ' + x[1] : 'empty' });
      if (x) { it.appendChild(iconCircle(x[0], { d: o.d || 52, s: 24, bg: o.bg || 'card2' })); it.appendChild(T(x[1], { s: 12, w: 'Medium', c: 'sec', align: 'center' })); link(it, x[2]); }
      put(r, it, 'fill');
    }
    put(g, r, 'fill');
  }
  put(p, g, 'fill');
};
BL.balance = function (p, o) {
  var c = AL('v', { name: 'balance card', bg: grad('glow', 'card', 'v'), r: 20, pad: 20, gap: 6, stroke: 'line' });
  var lr = AL('h', { gap: 6, align: 'center' }); lr.appendChild(T(o.label || 'Estimated balance', { s: 13, c: 'sec' })); lr.appendChild(link(I(o.hidden ? 'visibility_off' : 'visibility', { s: 16, c: 'sec' }), 'self'));
  if (o.unit) { var sp = rect(1, 1, null); put(lr, sp, 'fill'); lr.appendChild(chips([o.unit], 0, { h: 26, on: 'card2' })); }
  put(c, lr, 'fill');
  put(c, R([[o.hidden ? '******' : o.v, { w: 'Bold' }], [o.hidden ? '' : (' ' + (o.cur || 'USDT')), { s: 15, c: 'sec', w: 'Medium' }]], { s: 32, lh: 40 }), 'fill');
  if (o.s) put(c, T(o.hidden ? '≈ ******' : o.s, { s: 14, c: 'mut' }), 'fill');
  if (o.pnl) put(c, R([["Today's PnL  ", { c: 'mut' }], [o.pnl, { c: String(o.pnl).charAt(0) === '-' ? 'neg' : 'pos', w: 'SemiBold' }]], { s: 13 }), 'fill');
  if (o.btns) { var br = AL('h', { gap: 10, name: 'balance actions' }); o.btns.forEach(function (x, i) { put(br, button(x[0], i === 0 ? 'primary' : 'secondary', { small: true, to: x[1], icon: x[2] }), 'fill'); }); c.appendChild(rect(1, 8, null)); put(c, br, 'fill'); }
  put(p, link(c, o.to), 'fill');
};
BL.banner = function (p, o) {
  var c = AL('h', { name: 'banner', bg: grad(o.a || '#0F2A20', o.b || '#1D6B4B'), r: 18, pad: [18, 18], gap: 12, align: 'center' });
  var l = AL('v', { gap: 6 });
  if (o.k) l.appendChild(tag(o.k, 'mint', { solid: true }));
  put(l, T(o.t, { s: 18, w: 'Bold', c: 'white', lh: 23 }), 'fill');
  if (o.s) put(l, T(o.s, { s: 13, c: '#CFEFE1' }), 'fill');
  if (o.cta) l.appendChild(T(o.cta + '  →', { s: 13, w: 'SemiBold', c: 'mint' }));
  put(c, l, 'fill');
  c.appendChild(iconCircle(o.ic || 'rocket_launch', { d: 72, s: 40, bg: 'mint', c: 'onMint' }));
  if (o.dots) { var w = AL('v', { gap: 10, align: 'center' }); put(w, link(c, o.to), 'fill'); var d = AL('h', { gap: 6, justify: 'center' }); for (var i = 0; i < o.dots; i++) d.appendChild(rect(i === 0 ? 18 : 6, 6, i === 0 ? 'mint' : 'line', { r: 3 })); w.appendChild(d); put(p, w, 'fill'); }
  else put(p, link(c, o.to), 'fill');
};
BL.notice = function (p, t, o) {
  var k = o.k || 'info', cc = { info: 'info', warn: 'warn', danger: 'neg', success: 'pos', mint: 'mint' }[k];
  var ic = { info: 'info', warn: 'warning_amber', danger: 'error_outline', success: 'check_circle', mint: 'bolt' }[k];
  var f = AL('h', { name: 'notice ' + k, bg: cc, op: 0.1, r: 12, pad: [12, 14], gap: 10, align: 'min', stroke: cc, sop: 0.35 });
  f.appendChild(I(o.ic || ic, { s: 20, c: cc }));
  var col2 = AL('v', { gap: 6 });
  put(col2, T(t, { s: 13, c: 'fg', lh: 18 }), 'fill');
  if (o.action) col2.appendChild(link(T(o.action, { s: 13, w: 'SemiBold', c: cc === 'info' ? 'mint' : cc }), o.to));
  put(f, col2, 'fill');
  put(p, f, 'fill');
};
BL.badge = function (p, k, o) {
  var cc = { success: 'pos', error: 'neg', warn: 'warn', pending: 'info', info: 'mint', lock: 'warn' }[k] || 'mint';
  var ic = { success: 'check', error: 'close', warn: 'priority_high', pending: 'schedule', info: o.ic || 'info', lock: 'lock' }[k] || o.ic;
  var w = AL('h', { justify: 'center', name: 'status badge' });
  var outer = AL('h', { bg: cc, op: 0.14, r: 56, align: 'center', justify: 'center' }); outer.resize(112, 112); outer.primaryAxisSizingMode = 'FIXED'; outer.counterAxisSizingMode = 'FIXED';
  var inner = AL('h', { bg: cc, r: 38, align: 'center', justify: 'center' }); inner.resize(76, 76); inner.primaryAxisSizingMode = 'FIXED'; inner.counterAxisSizingMode = 'FIXED';
  inner.appendChild(I(o.ic || ic, { s: 42, c: cc === 'neg' ? 'white' : 'onMint' })); outer.appendChild(inner); w.appendChild(outer);
  put(p, w, 'fill');
};
BL.otp = function (p, o) {
  var f = AL('h', { gap: 8, justify: 'center', name: 'code input' }), n = o.n || 6, v = o.v || '';
  for (var i = 0; i < n; i++) {
    var b = AL('h', { bg: 'card', r: 12, stroke: o.error ? 'neg' : (i === v.length ? 'mint' : 'line'), align: 'center', justify: 'center' });
    b.resize(48, 56); b.primaryAxisSizingMode = 'FIXED'; b.counterAxisSizingMode = 'FIXED';
    if (v[i]) b.appendChild(T(v[i], { s: 22, w: 'SemiBold', c: o.error ? 'neg' : 'fg' })); else if (i === v.length) b.appendChild(rect(2, 24, 'mint'));
    put(f, b, 'fill');
  }
  put(p, f, 'fill');
};
BL.qr = function (p, o) {
  var S = o.size || 184, N = 25, m = (S - 24) / N;
  var w = AL('h', { justify: 'center', name: 'qr-wrap' });
  var f = box(S, S, { bg: 'white', r: 16, name: 'QR code' });
  var rnd = seeded(o.seed || 11);
  function finder(x, y) { var a = rect(7 * m, 7 * m, 'black', { r: 2 }); var b = rect(5 * m, 5 * m, 'white'); var c = rect(3 * m, 3 * m, 'black', { r: 1 }); [a, b, c].forEach(function (r, i) { f.appendChild(r); r.x = 12 + (x + i) * m; r.y = 12 + (y + i) * m; }); }
  for (var yy = 0; yy < N; yy++) for (var xx = 0; xx < N; xx++) {
    var inF = (xx < 8 && yy < 8) || (xx > N - 9 && yy < 8) || (xx < 8 && yy > N - 9);
    if (inF || rnd() < 0.52) continue;
    var r = rect(m, m, 'black'); f.appendChild(r); r.x = 12 + xx * m; r.y = 12 + yy * m;
  }
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  var lg = box(40, 40, { bg: 'white', r: 10 }); f.appendChild(lg); lg.x = S / 2 - 20; lg.y = S / 2 - 20; var cn = coin(o.coin || 'NVXO', 32); lg.appendChild(cn); cn.x = 4; cn.y = 4;
  w.appendChild(f); put(p, w, 'fill');
};
BL.address = function (p, o) {
  var c = card({ gap: 6, pad: 14, name: 'address' });
  if (o.label) put(c, T(o.label, { s: 12, c: 'mut' }), 'fill');
  var r = AL('h', { gap: 12, align: 'center' }); put(r, T(o.v, { s: 14, mono: true, w: 'Medium' }), 'fill'); r.appendChild(link(iconCircle('content_copy', { d: 36, s: 18 }), 'toast'));
  put(c, r, 'fill'); put(p, c, 'fill');
};
BL.steps = function (p, labels, o) {
  var n = labels.length, a = o.a || 0, f = box(CW, 58, { name: 'stepper' });
  var gap = CW / n;
  for (var i = 0; i < n; i++) {
    var cx = gap * i + gap / 2;
    if (i < n - 1) { var l = rect(gap - 36, 2, i < a ? 'mint' : 'line', { r: 1 }); f.appendChild(l); l.x = cx + 18; l.y = 13; }
    var done = i < a, on = i === a;
    var c = AL('h', { bg: done || on ? 'mint' : 'card2', r: 14, align: 'center', justify: 'center' }); c.resize(28, 28); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED';
    c.appendChild(done ? I('check', { s: 18, c: 'onMint' }) : T(String(i + 1), { s: 13, w: 'Bold', c: on ? 'onMint' : 'mut' }));
    f.appendChild(c); c.x = cx - 14; c.y = 0;
    var t = T(labels[i], { s: 11, w: on ? 'SemiBold' : 'Medium', c: on ? 'fg' : 'mut', align: 'center' }); t.textAutoResize = 'HEIGHT'; t.resize(gap - 4, 14); f.appendChild(t); t.x = cx - (gap - 4) / 2; t.y = 36;
  }
  put(p, f, 'fill');
};
BL.progress = function (p, o) {
  var c = AL('v', { gap: 8, name: 'progress' });
  if (o.l || o.r) { var r = AL('h', { justify: 'between' }); r.appendChild(T(o.l || '', { s: 13, c: 'mut' })); r.appendChild(T(o.r || '', { s: 13, w: 'SemiBold', c: o.rc || 'fg' })); put(c, r, 'fill'); }
  var tr = box(CW, o.h || 8, { bg: 'card2', r: 4, clip: true, name: 'track' }); var fi = rect(CW * (o.v || 0.5), o.h || 8, o.c || 'mint', { r: 4 }); tr.appendChild(fi);
  put(c, tr, 'fill');
  if (o.s) put(c, T(o.s, { s: 12, c: 'mut' }), 'fill');
  put(p, c, 'fill');
};
BL.chart = function (p, o) {
  var w = o.w || CW, h = o.h || 220, f = box(w, h, { name: 'chart ' + (o.kind || 'line'), clip: true });
  for (var g = 1; g < 4; g++) { var gl = rect(w, 1, 'line'); gl.opacity = 0.5; f.appendChild(gl); gl.y = h * g / 4; }
  var up = o.up !== false;
  if (o.kind === 'candle') {
    var r = seeded(o.seed || 21), n = o.n || 42, v = 50, cw = (w - 44) / n;
    var pts = [];
    for (var i = 0; i < n; i++) { var op = v; v += (r() - (up ? 0.42 : 0.58)) * 9; v = Math.max(12, Math.min(88, v)); var hi = Math.max(op, v) + r() * 5, lo = Math.min(op, v) - r() * 5; pts.push([op, v, hi, lo]); }
    pts.forEach(function (q, i) {
      var isUp = q[1] >= q[0], c = isUp ? 'pos' : 'neg', x = i * cw + cw / 2;
      var wick = rect(1, (q[2] - q[3]) / 100 * h, c); f.appendChild(wick); wick.x = x; wick.y = h - q[2] / 100 * h;
      var bh = Math.max(1.5, Math.abs(q[1] - q[0]) / 100 * h); var body = rect(Math.max(2, cw - 2.5), bh, c, { r: 1 }); f.appendChild(body); body.x = x - (cw - 2.5) / 2 + 0.5; body.y = h - Math.max(q[0], q[1]) / 100 * h;
      if (o.vol) { var vb = rect(Math.max(2, cw - 2.5), 6 + r() * 26, c); vb.opacity = 0.35; f.appendChild(vb); vb.x = body.x; vb.y = h - vb.height; }
    });
    var last = pts[pts.length - 1][1];
    var pl = rect(w, 1, up ? 'pos' : 'neg'); pl.dashPattern = [3, 3]; pl.opacity = 0.7; f.appendChild(pl); pl.y = h - last / 100 * h;
    var tagf = AL('h', { bg: up ? 'pos' : 'neg', r: 4, pad: [2, 5] }); tagf.appendChild(T(o.price || '67,412.5', { s: 10, w: 'SemiBold', c: up ? 'onMint' : 'white' })); f.appendChild(tagf); tagf.x = w - tagf.width; tagf.y = pl.y - 8;
  } else {
    var s = series(o.n || 60, o.seed || 5, up, o.volat || 5), mn = Math.min.apply(null, s), mx = Math.max.apply(null, s), ww = w - (o.axis ? 44 : 0);
    var pts2 = s.map(function (v, i) { return [i * ww / (s.length - 1), 12 + (h - 24) - (v - mn) / (mx - mn || 1) * (h - 24)]; });
    var d = pts2.map(function (q, i) { return (i ? 'L ' : 'M ') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
    var area = figma.createVector(); area.vectorPaths = [{ windingRule: 'NONZERO', data: d + ' L ' + ww.toFixed(1) + ' ' + h + ' L 0 ' + h + ' Z' }]; area.fills = [gradA(up ? 'pos' : 'neg', 0.28, 0)]; area.strokes = []; area.name = 'area'; f.appendChild(area); area.x = 0; area.y = 0;
    var ln = figma.createVector(); ln.vectorPaths = [{ windingRule: 'NONE', data: d }]; ln.strokes = [paint(up ? 'pos' : 'neg')]; ln.strokeWeight = 2; ln.fills = []; ln.name = 'line'; f.appendChild(ln);
    ln.x = Math.min.apply(null, pts2.map(function (q) { return q[0]; })); ln.y = Math.min.apply(null, pts2.map(function (q) { return q[1]; }));
    area.x = 0; area.y = ln.y;
    var lp = pts2[pts2.length - 1]; var dot = circle(10, up ? 'pos' : 'neg'); f.appendChild(dot); dot.x = lp[0] - 5; dot.y = lp[1] - 5;
    if (o.marks) o.marks.forEach(function (mk) { var q = pts2[Math.min(pts2.length - 1, mk)]; var md = circle(8, 'mint', { stroke: 'bg', sw: 2 }); f.appendChild(md); md.x = q[0] - 4; md.y = q[1] - 4; });
  }
  if (o.axis) { var labels = o.axis; for (var k = 0; k < labels.length; k++) { var al = T(labels[k], { s: 10, c: 'mut' }); f.appendChild(al); al.x = w - al.width; al.y = h * k / (labels.length - 1) - (k === labels.length - 1 ? 14 : (k ? 7 : 0)); } }
  put(p, f, 'fill');
};
BL.slider = function (p, o) {
  var f = box(CW, o.labels === false ? 24 : 42, { name: 'slider' }), pct = o.pct || 0, cc = o.c || 'mint', w = CW - 8;
  var tr = rect(w, 4, 'card2', { r: 2 }); f.appendChild(tr); tr.x = 4; tr.y = 10;
  var fi = rect(Math.max(0.1, w * pct), 4, cc, { r: 2 }); f.appendChild(fi); fi.x = 4; fi.y = 10;
  var marks = o.marks || 5;
  for (var i = 0; i < marks; i++) { var x = 4 + w * i / (marks - 1); var on = i / (marks - 1) <= pct; var d = box(12, 12, { r: 3, bg: on ? cc : 'bg', stroke: on ? cc : 'mut' }); d.rotation = 45; f.appendChild(d); d.x = x - 1; d.y = 3; }
  var th = circle(20, 'white', { stroke: cc, sw: 4 }); f.appendChild(th); th.x = 4 + w * pct - 10; th.y = 2;
  if (o.labels !== false) { var ls = o.labels || ['0%', '25%', '50%', '75%', '100%']; for (var j = 0; j < ls.length; j++) { var t = T(ls[j], { s: 11, c: 'mut' }); f.appendChild(t); t.x = Math.max(0, Math.min(CW - t.width, 4 + w * j / (ls.length - 1) - t.width / 2)); t.y = 26; } }
  put(p, f, 'fill');
};
BL.empty = function (p, o, oo, ctx) {
  var c = AL('v', { gap: 12, align: 'center', pad: [o.pt != null ? o.pt : 24, 0, 8, 0], name: 'empty state' });
  c.appendChild(iconCircle(o.ic || 'inbox', { d: 96, s: 44, c: o.icc || 'mut' }));
  put(c, T(o.t, { s: 18, w: 'SemiBold', align: 'center' }), 'fill');
  if (o.s) put(c, T(o.s, { s: 14, c: 'mut', align: 'center' }), 'fill');
  if (o.cta) c.appendChild(button(o.cta, o.k || 'secondary', { small: true, w: 180, to: o.to }));
  put(p, c, 'fill');
};
