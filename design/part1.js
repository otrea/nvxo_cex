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

