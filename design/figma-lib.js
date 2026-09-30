// NVXO CEX — Figma screen builder library.
// Stored in the Figma file as shared plugin data (namespace "nvxo", key "lib") and executed with
//   const L = await new AsyncFunction('figma', LIB)(figma)
// No template literals in this file (it is uploaded inside String.raw).
var THEMES = {
  dark: { bg:'#000000', card:'#121318', card2:'#1C1D24', line:'#2A2B33', fg:'#FFFFFF', sec:'#B9BAC1', mut:'#7C7D86',
    mint:'#58F9B0', onMint:'#000000', pos:'#58F9B0', neg:'#FF4D5E', warn:'#FFB547', info:'#6AB2FF', gold:'#D4B45F',
    tab:'#0D0E12', white:'#FFFFFF', black:'#000000', glow:'#0B2A1E', dim:'#000000' },
  light: { bg:'#F4F5F7', card:'#FFFFFF', card2:'#ECEDF1', line:'#DFE1E6', fg:'#0B0C10', sec:'#3E4049', mut:'#7C7E88',
    mint:'#16B877', onMint:'#FFFFFF', pos:'#12A86B', neg:'#E5374A', warn:'#D98A00', info:'#2F7FE0', gold:'#B8963A',
    tab:'#FFFFFF', white:'#FFFFFF', black:'#000000', glow:'#DDF8EC', dim:'#000000' }
};
var P = THEMES.dark, THEME = 'dark';
var W = 393, H0 = 852, PADX = 20, CW = W - PADX * 2;
var BAD_ICONS = {}, ERRORS = [];
var COMP = {};

function hex(h) { h = h.replace('#', ''); return { r: parseInt(h.substr(0, 2), 16) / 255, g: parseInt(h.substr(2, 2), 16) / 255, b: parseInt(h.substr(4, 2), 16) / 255 }; }
function col(k) { if (!k) return P.fg; if (k.charAt(0) === '#') return k; return P[k] || k; }
function paint(k, op) { var p = { type: 'SOLID', color: hex(col(k)) }; if (op != null && op < 1) p.opacity = op; return p; }
function grad(a, b, dir) {
  var t = dir === 'v' ? [[0, 1, 0], [-1, 0, 1]] : [[1, 0, 0], [0, 1, 0]];
  var ca = hex(col(a)), cb = hex(col(b));
  return { type: 'GRADIENT_LINEAR', gradientTransform: t, gradientStops: [
    { position: 0, color: { r: ca.r, g: ca.g, b: ca.b, a: 1 } }, { position: 1, color: { r: cb.r, g: cb.g, b: cb.b, a: 1 } }] };
}
function gradA(k, a0, a1) { var c = hex(col(k)); return { type: 'GRADIENT_LINEAR', gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [
  { position: 0, color: { r: c.r, g: c.g, b: c.b, a: a0 } }, { position: 1, color: { r: c.r, g: c.g, b: c.b, a: a1 } }] }; }

var FONTS = [['SUSE', 'Light'], ['SUSE', 'Regular'], ['SUSE', 'Medium'], ['SUSE', 'SemiBold'], ['SUSE', 'Bold'], ['SUSE', 'ExtraBold'],
  ['SUSE Mono', 'Regular'], ['SUSE Mono', 'Medium'], ['SUSE Mono', 'SemiBold'], ['Material Icons Round', 'Regular']];
async function init(theme) {
  for (var i = 0; i < FONTS.length; i++) await figma.loadFontAsync({ family: FONTS[i][0], style: FONTS[i][1] });
  setTheme(theme || 'dark');
  var ap = figma.root.children.filter(function (p) { return p.name.indexOf('03') === 0; })[0];
  if (ap) { await ap.loadAsync(); ap.findAllWithCriteria({ types: ['COMPONENT'] }).forEach(function (c) { if (!COMP[c.name.toLowerCase()]) COMP[c.name.toLowerCase()] = c; }); }
}
function setTheme(t) { THEME = t; P = THEMES[t]; }

// ---------- primitives ----------
function T(str, o) {
  o = o || {};
  var t = figma.createText();
  t.fontName = { family: o.mono ? 'SUSE Mono' : 'SUSE', style: o.w || 'Regular' };
  t.fontSize = o.s || 15;
  t.characters = String(str == null ? '' : str);
  t.fills = [paint(o.c || 'fg', o.op)];
  if (o.lh) t.lineHeight = { unit: 'PIXELS', value: o.lh };
  else if ((o.s || 15) <= 16) t.lineHeight = { unit: 'PERCENT', value: 135 };
  if (o.ls != null) t.letterSpacing = { unit: 'PERCENT', value: o.ls };
  if (o.align) t.textAlignHorizontal = o.align === 'center' ? 'CENTER' : (o.align === 'right' ? 'RIGHT' : 'LEFT');
  if (o.upper) t.textCase = 'UPPER';
  t.name = o.name || String(str).slice(0, 40);
  return t;
}
// rich text: parts [[text, {w,c,s,mono}], ...]
function R(parts, o) {
  o = o || {};
  var s = parts.map(function (p) { return p[0]; }).join('');
  var t = T(s, o), i = 0;
  parts.forEach(function (p) {
    var q = p[1] || {}, n = p[0].length;
    if (n) {
      if (q.w || q.mono) t.setRangeFontName(i, i + n, { family: q.mono ? 'SUSE Mono' : 'SUSE', style: q.w || o.w || 'Regular' });
      if (q.c) t.setRangeFills(i, i + n, [paint(q.c)]);
      if (q.s) t.setRangeFontSize(i, i + n, q.s);
    }
    i += n;
  });
  return t;
}
function I(name, o) {
  o = o || {};
  var s = o.s || 24;
  var t = figma.createText();
  t.fontName = { family: 'Material Icons Round', style: 'Regular' };
  t.characters = name; t.fontSize = s; t.fills = [paint(o.c || 'fg', o.op)];
  t.lineHeight = { unit: 'PIXELS', value: s }; t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.name = 'icon/' + name;
  if (t.width > s * 1.6) BAD_ICONS[name] = 1;
  return t;
}
function AL(dir, o) {
  o = o || {};
  var f = figma.createAutoLayout(dir === 'h' ? 'HORIZONTAL' : 'VERTICAL');
  f.fills = o.bg ? (typeof o.bg === 'string' ? [paint(o.bg, o.op)] : [o.bg]) : [];
  f.name = o.name || (dir === 'h' ? 'row' : 'stack');
  f.itemSpacing = o.gap || 0;
  var p = o.pad; if (typeof p === 'number') p = [p, p, p, p]; if (p && p.length === 2) p = [p[0], p[1], p[0], p[1]];
  if (p) { f.paddingTop = p[0]; f.paddingRight = p[1]; f.paddingBottom = p[2]; f.paddingLeft = p[3]; }
  if (o.r) f.cornerRadius = o.r;
  if (o.stroke) { f.strokes = [paint(o.stroke, o.sop)]; f.strokeWeight = o.sw || 1; f.strokeAlign = 'INSIDE'; if (o.dash) f.dashPattern = [6, 4]; }
  f.counterAxisAlignItems = o.align === 'center' ? 'CENTER' : (o.align === 'end' ? 'MAX' : (o.align === 'base' ? 'BASELINE' : 'MIN'));
  f.primaryAxisAlignItems = o.justify === 'center' ? 'CENTER' : (o.justify === 'end' ? 'MAX' : (o.justify === 'between' ? 'SPACE_BETWEEN' : 'MIN'));
  f.clipsContent = !!o.clip;
  return f;
}
// append + sizing: 'fill' (fill width / grow in row), 'hug'
function put(parent, child, how) {
  parent.appendChild(child);
  if (how === 'fill') {
    child.layoutSizingHorizontal = 'FILL';
    if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT';
  } else if (how === 'fillv') {
    child.layoutSizingVertical = 'FILL';
  }
  return child;
}
function rect(w, h, c, o) {
  o = o || {};
  var r = figma.createRectangle(); r.resize(Math.max(0.01, w), Math.max(0.01, h));
  r.fills = c ? (typeof c === 'string' ? [paint(c, o.op)] : [c]) : [];
  if (o.r) r.cornerRadius = o.r;
  if (o.stroke) { r.strokes = [paint(o.stroke)]; r.strokeWeight = o.sw || 1; }
  r.name = o.name || 'rect';
  return r;
}
function circle(d, c, o) { o = o || {}; var e = figma.createEllipse(); e.resize(d, d); e.fills = c ? [paint(c, o.op)] : []; if (o.stroke) { e.strokes = [paint(o.stroke)]; e.strokeWeight = o.sw || 1.5; } e.name = o.name || 'circle'; return e; }
function box(w, h, o) { o = o || {}; var f = figma.createFrame(); f.resize(w, h); f.fills = o.bg ? [paint(o.bg, o.op)] : []; f.clipsContent = !!o.clip; if (o.r) f.cornerRadius = o.r; f.name = o.name || 'box'; if (o.stroke) { f.strokes = [paint(o.stroke)]; f.strokeWeight = 1; f.strokeAlign = 'INSIDE'; } return f; }
function link(node, to) { if (to) { node.setSharedPluginData('nvxo', 'to', to); node.name = node.name + ' → ' + to; } return node; }
function iconCircle(ic, o) {
  o = o || {};
  var d = o.d || 40, f = AL('h', { name: 'icon-circle', bg: o.bg || 'card2', r: d / 2, align: 'center', justify: 'center', op: o.op });
  f.resize(d, d); f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.appendChild(I(ic, { s: o.s || Math.round(d * 0.55), c: o.c || 'mint' }));
  return f;
}
var COIN_COL = { BTC: '#F7931A', ETH: '#627EEA', USDT: '#26A17B', USDC: '#2775CA', BNB: '#F3BA2F', SOL: '#9945FF', XRP: '#23292F', ADA: '#0033AD', DOGE: '#C2A633', TRX: '#EF0027', LTC: '#345D9D', DOT: '#E6007A', LINK: '#2A5ADA', MATIC: '#8247E5', POL: '#8247E5', AVAX: '#E84142', TON: '#0098EA', SHIB: '#FFA409', EUR: '#1B4DB1', PEPE: '#3D9A3A', ARB: '#28A0F0' };
function coin(sym, d) {
  d = d || 32; sym = String(sym).toUpperCase();
  if (sym === 'NVXO') {
    var m = COMP['logo / nvxo mark'];
    var f = box(d, d, { r: d / 2, bg: 'black', clip: true, name: 'coin/NVXO' });
    if (m) { var i = m.createInstance(); i.rescale(d * 0.6 / Math.max(i.width, i.height)); f.appendChild(i); i.x = (d - i.width) / 2; i.y = (d - i.height) / 2; }
    else { var t = T('N', { s: d * 0.5, w: 'Bold', c: 'mint' }); f.appendChild(t); t.x = (d - t.width) / 2; t.y = (d - t.height) / 2; }
    f.strokes = [paint('mint')]; f.strokeWeight = 1;
    return f;
  }
  var c = COMP[sym.toLowerCase()];
  if (c && c.width > 100) {
    var inst = c.createInstance(); inst.rescale(d / inst.width); inst.name = 'coin/' + sym; return inst;
  }
  var g = AL('h', { name: 'coin/' + sym, bg: COIN_COL[sym] || '#3A3B44', r: d / 2, align: 'center', justify: 'center' });
  g.resize(d, d); g.primaryAxisSizingMode = 'FIXED'; g.counterAxisSizingMode = 'FIXED';
  g.appendChild(T(sym === 'EUR' ? '€' : sym.charAt(0), { s: Math.round(d * 0.46), w: 'Bold', c: 'white', lh: Math.round(d * 0.6) }));
  return g;
}
function toggle(on) {
  var f = box(46, 28, { r: 14, bg: on ? 'mint' : 'line', name: on ? 'toggle/on' : 'toggle/off' });
  var k = circle(22, on ? 'onMint' : 'white'); f.appendChild(k); k.x = on ? 21 : 3; k.y = 3; return f;
}
function check(on) { var f = box(22, 22, { r: 6, bg: on ? 'mint' : null, stroke: on ? null : 'mut', name: on ? 'check/on' : 'check/off' }); if (on) { var i = I('check', { s: 18, c: 'onMint' }); f.appendChild(i); i.x = 2; i.y = 2; } return f; }
function radio(on) { var f = box(22, 22, { r: 11, stroke: on ? 'mint' : 'mut', name: 'radio' }); f.strokeWeight = 2; if (on) { var c = circle(10, 'mint'); f.appendChild(c); c.x = 6; c.y = 6; } return f; }
function seeded(seed) { var s = seed || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function series(n, seed, up, vol) { var r = seeded(seed), v = 50, out = []; for (var i = 0; i < n; i++) { v += (r() - (up ? 0.44 : 0.56)) * (vol || 6); v = Math.max(8, Math.min(92, v)); out.push(v); } return out; }
function spark(w, h, up, seed) {
  var s = series(24, seed || 3, up, 9), mn = Math.min.apply(null, s), mx = Math.max.apply(null, s);
  var d = s.map(function (v, i) { return (i ? 'L ' : 'M ') + (i * w / (s.length - 1)).toFixed(1) + ' ' + (h - (v - mn) / (mx - mn || 1) * h).toFixed(1); }).join(' ');
  var v = figma.createVector(); v.vectorPaths = [{ windingRule: 'NONE', data: d }]; v.strokes = [paint(up ? 'pos' : 'neg')]; v.strokeWeight = 1.5; v.fills = []; v.name = 'sparkline'; return v;
}

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
  var sl = AL('v', {}); put(L, sl, 'fill'); BL.slider(sl, { pct: o.pct || 0, labels: false, c: sell ? 'neg' : 'pos' }); sl.children[0].resize(206, 24);
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
  var fmt = function (v) { return v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); };
  var rowsA = [];
  for (var i = n; i >= 1; i--) rowsA.push(r2(fmt(mid + i * 0.5 + (i > 4 ? i : 0)), (rnd() * 0.9 + 0.001).toFixed(4), 'ask'));
  rowsA.forEach(function (x) { put(c, x, 'fill'); });
  var m = AL('v', { gap: 0, pad: [6, 0], name: 'mid price' }); m.appendChild(T(o.mid || '67,412.50', { s: 17, w: 'Bold', c: 'pos' })); m.appendChild(T('≈ $67,412.50', { s: 11, c: 'mut' })); put(c, m, 'fill');
  for (var j = 1; j <= n; j++) put(c, r2(fmt(mid - j * 0.5 - (j > 4 ? j : 0)), (rnd() * 0.9 + 0.001).toFixed(4), 'bid'), 'fill');
  c.children.forEach(function (ch) { if (ch.name.indexOf('ask') === 0 || ch.name.indexOf('bid') === 0) { var b = ch.children[0]; b.x = ch.width - b.width; b.y = 0; } });
  return c;
}

// ---------- screen chrome ----------
function statusBar(f) {
  var s = box(W, 50, { name: 'status bar' }); f.appendChild(s); s.x = 0; s.y = 0;
  var t = T('9:41', { s: 16, w: 'SemiBold' }); s.appendChild(t); t.x = 36; t.y = 16;
  var ic = AL('h', { gap: 5, align: 'center' }); ['signal_cellular_alt', 'wifi', 'battery_full'].forEach(function (n) { var x = I(n, { s: 17 }); ic.appendChild(x); }); s.appendChild(ic); ic.x = W - 30 - ic.width; ic.y = 17;
}
function header(f, h) {
  var hb = AL('h', { name: 'header', align: 'center', gap: 12, pad: [0, 16] }); hb.resize(W, 56); hb.primaryAxisSizingMode = 'FIXED'; hb.counterAxisSizingMode = 'FIXED';
  f.appendChild(hb); hb.x = 0; hb.y = 50;
  if (h.home) {
    var av = AL('h', { bg: 'mint', r: 19, align: 'center', justify: 'center' }); av.resize(38, 38); av.primaryAxisSizingMode = 'FIXED'; av.counterAxisSizingMode = 'FIXED'; av.appendChild(T(h.ini || 'JN', { s: 14, w: 'Bold', c: 'onMint' })); hb.appendChild(link(av, 'C05'));
    var tx = AL('v', { gap: 0 }); tx.appendChild(T(h.hello || 'Welcome back', { s: 12, c: 'mut' })); tx.appendChild(T(h.name || 'Jan Novák', { s: 16, w: 'SemiBold' })); put(hb, tx, 'fill');
  } else if (h.logo) {
    var c = COMP['logo / nvxo cex']; var lw = AL('h', {}); if (c) { var i = c.createInstance(); i.rescale(32 / i.height); lw.appendChild(i); } put(hb, link(lw, h.logoTo), 'fill');
  } else {
    var bk = h.back === false ? null : AL('h', { bg: h.close ? 'card2' : 'mint', r: 18, align: 'center', justify: 'center', name: 'back' });
    if (bk) { bk.resize(36, 36); bk.primaryAxisSizingMode = 'FIXED'; bk.counterAxisSizingMode = 'FIXED'; bk.appendChild(I(h.close ? 'close' : 'chevron_left', { s: 24, c: h.close ? 'fg' : 'onMint' })); hb.appendChild(link(bk, h.backTo || 'back')); }
    var tt = T(h.t || '', { s: h.big ? 24 : 18, w: 'Bold', align: h.left || h.big ? 'left' : 'center' }); put(hb, tt, 'fill');
    if (!h.left && !h.big && bk && !(h.right && h.right.length)) { var ph = rect(36, 36, null, { name: 'balance' }); hb.appendChild(ph); }
  }
  (h.right || []).forEach(function (x) {
    if (x[0] === 'text') hb.appendChild(link(T(x[1], { s: 15, w: 'SemiBold', c: x[3] || 'mint' }), x[2]));
    else if (x[0] === 'chip') hb.appendChild(link(chips([x[1]], 0, { h: 30, on: 'card2' }), x[2]));
    else hb.appendChild(link(I(x[0], { s: 24, c: x[3] || 'fg' }), x[1]));
  });
  if (h.left || h.big) { /* title left aligned */ }
  if (!h.home && !h.logo && h.back !== false && h.right && h.right.length === 1 && !h.left && !h.big) { /* keep centered roughly */ }
  return hb;
}
var TABS = [['home', 'Home', 'C01'], ['bar_chart', 'Markets', 'D01'], ['swap_horiz', 'Trade', 'E01'], ['account_balance_wallet', 'Wallets', 'F01']];
function tabBar(f, active) {
  var tb = AL('h', { name: 'tab bar', bg: 'tab', pad: [10, 8, 26, 8], align: 'min' }); tb.resize(W, 84); tb.primaryAxisSizingMode = 'FIXED'; tb.counterAxisSizingMode = 'FIXED';
  tb.strokes = [paint('line')]; tb.strokeTopWeight = 1; tb.strokeBottomWeight = 0; tb.strokeLeftWeight = 0; tb.strokeRightWeight = 0;
  TABS.forEach(function (t, i) {
    var on = t[1].toLowerCase() === active;
    var it = AL('v', { gap: 4, align: 'center', name: 'tab ' + t[1] });
    it.appendChild(I(t[0], { s: 26, c: on ? 'mint' : 'mut' })); it.appendChild(T(t[1], { s: 11, w: on ? 'SemiBold' : 'Medium', c: on ? 'mint' : 'mut' }));
    put(tb, link(it, on ? null : (active === 'guest' && i === 3 ? 'A06' : t[2])), 'fill');
  });
  f.appendChild(tb); return tb;
}
function homeIndicator(f) { var r = rect(134, 5, 'fg', { r: 3, name: 'home indicator' }); f.appendChild(r); r.x = (W - 134) / 2; r.y = f.height - 13; }

// spec: {id,name,head:{...}|null,tab,blocks,foot:[[label,kind,to,icon]],footNote,vcenter,align,gap,pad,minH,bg,sheet:{over,title,blocks,foot,sub}}
function screen(sp) {
  var f = figma.createFrame(); f.name = sp.id + ' · ' + sp.name; f.resize(W, H0); f.fills = [paint(sp.bg || 'bg')]; f.clipsContent = true;
  statusBar(f);
  var top = 50;
  if (sp.head !== null && sp.head !== undefined) { header(f, sp.head); top = 106; }
  var body = AL('v', { name: 'content', gap: sp.gap != null ? sp.gap : 16, pad: [sp.pt != null ? sp.pt : 8, sp.px != null ? sp.px : PADX, 8, sp.px != null ? sp.px : PADX], align: sp.align === 'center' ? 'center' : 'min' });
  body.resize(W, 10); body.counterAxisSizingMode = 'FIXED'; body.primaryAxisSizingMode = 'AUTO';
  f.appendChild(body); body.x = 0; body.y = top;
  blocks(body, sp.blocks, { align: sp.align });
  var foot = null;
  if (sp.foot && sp.foot.length) {
    foot = AL('v', { name: 'footer', gap: 10, pad: [12, PADX, 0, PADX], align: 'center' }); foot.resize(W, 10); foot.counterAxisSizingMode = 'FIXED';
    if (sp.footTop) blocks(foot, sp.footTop, {});
    sp.foot.forEach(function (x) { put(foot, button(x[0], x[1], { to: x[2], icon: x[3], disabled: x[4] }), 'fill'); });
    if (sp.footNote) put(foot, T(sp.footNote, { s: 12, c: 'mut', align: 'center' }), 'fill');
    f.appendChild(foot);
  }
  var tabH = sp.tab ? 84 : 0, footH = foot ? foot.height : 0;
  var need = top + body.height + (foot ? footH + 16 : 0) + (tabH || 34);
  var Hh = Math.max(sp.minH || H0, Math.ceil(need));
  f.resize(W, Hh);
  if (foot) foot.y = Hh - tabH - (tabH ? 12 : 34) - footH;
  if (sp.vcenter) { var avail = (foot ? foot.y : Hh - tabH - 34) - top; body.y = top + Math.max(0, (avail - body.height) / 2 - 10); }
  if (sp.tab) { var tb = tabBar(f, sp.tab); tb.x = 0; tb.y = Hh - 84; }
  homeIndicator(f);
  if (sp.sheet) sheet(f, sp.sheet);
  return f;
}
var BUILT = {};
function findFrame(id) {
  if (BUILT[id]) return BUILT[id];
  var pg = figma.currentPage; var r = pg.findOne(function (n) { return n.type === 'FRAME' && n.parent && (n.parent.type === 'SECTION' || n.parent.type === 'PAGE') && n.name.indexOf(id + ' · ') === 0; });
  return r;
}
function sheet(f, s) {
  if (s.over) {
    var src = findFrame(s.over);
    if (src) { var cl = src.clone(); f.insertChild(0, cl); cl.x = 0; cl.y = 0; f.resize(W, Math.max(f.height, H0)); f.children.forEach(function (ch) { if (ch !== cl && ch.name !== 'sheet') ch.visible = false; }); }
  }
  var ov = rect(W, f.height, 'dim', { op: 0.66, name: 'scrim' }); f.appendChild(ov); link(ov, 'back');
  var sh = AL('v', { name: 'sheet', bg: 'card', gap: s.gap || 14, pad: [10, PADX, 34, PADX] });
  sh.topLeftRadius = 24; sh.topRightRadius = 24; sh.resize(W, 10); sh.counterAxisSizingMode = 'FIXED';
  var gr = AL('h', { justify: 'center' }); gr.appendChild(rect(40, 5, 'line', { r: 3 })); put(sh, gr, 'fill');
  if (s.title) { var tr = AL('h', { justify: 'between', align: 'center' }); tr.appendChild(T(s.title, { s: 20, w: 'Bold' })); tr.appendChild(link(iconCircle('close', { d: 32, s: 18, c: 'fg' }), 'back')); put(sh, tr, 'fill'); }
  if (s.sub) put(sh, T(s.sub, { s: 14, c: 'sec' }), 'fill');
  blocks(sh, s.blocks, { align: s.align });
  (s.foot || []).forEach(function (x) { put(sh, button(x[0], x[1], { to: x[2], icon: x[3] }), 'fill'); });
  f.appendChild(sh); sh.x = 0; sh.y = f.height - sh.height;
  f.children.forEach(function (ch) { if (ch.name === 'status bar') { f.appendChild(ch); ch.visible = true; } });
}

// ---------- sections ----------
var ORDER = ['00', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'Z', 'Y'];
function getSection(key, title) {
  var pg = figma.currentPage, s = pg.children.filter(function (n) { return n.type === 'SECTION' && n.name.indexOf(key + ' · ') === 0; })[0];
  if (!s) { s = figma.createSection(); s.name = key + ' · ' + title; pg.appendChild(s); s.x = 0; s.y = 0; s.resizeWithoutConstraints(1000, 1000); s.fills = [paint('#0A0B0E')]; }
  return s;
}
function place(key, title, frames) {
  var s = getSection(key, title);
  var x = 120, maxH = 0;
  s.children.forEach(function (n) { x = Math.max(x, n.x + n.width + 100); maxH = Math.max(maxH, n.height); });
  frames.forEach(function (fr) { s.appendChild(fr); fr.x = x; fr.y = 160; x += fr.width + 100; maxH = Math.max(maxH, fr.height); });
  var hdr = s.children.filter(function (n) { return n.name === 'section title'; })[0];
  if (!hdr) { hdr = T(key + ' · ' + title, { s: 56, w: 'Bold', c: '#58F9B0' }); hdr.name = 'section title'; s.appendChild(hdr); hdr.x = 120; hdr.y = 40; }
  s.resizeWithoutConstraints(Math.max(1600, x + 20), maxH + 320);
  return s;
}
function relayout() {
  var pg = figma.currentPage, secs = pg.children.filter(function (n) { return n.type === 'SECTION'; });
  secs.sort(function (a, b) { return ORDER.indexOf(a.name.split(' · ')[0]) - ORDER.indexOf(b.name.split(' · ')[0]); });
  var y = 0; secs.forEach(function (s) { s.x = 0; s.y = y; y += s.height + 240; });
}
async function build(key, title, specs) {
  var out = {}, frames = [];
  for (var i = 0; i < specs.length; i++) {
    var sp = specs[i];
    try { var fr = screen(sp); BUILT[sp.id] = fr; frames.push(fr); out[sp.id] = fr.id; }
    catch (e) { ERRORS.push(sp.id + ': ' + e.message); }
  }
  place(key, title, frames); relayout();
  return { created: out, errors: ERRORS, badIcons: Object.keys(BAD_ICONS) };
}
return { init: init, build: build, screen: screen, place: place, relayout: relayout, setTheme: setTheme, BL: BL, T: T, I: I, AL: AL, put: put, P: function () { return P; }, errors: ERRORS, bad: BAD_ICONS, findFrame: findFrame, BUILT: BUILT };
