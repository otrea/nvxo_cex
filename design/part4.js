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
  if ((sp.foot && sp.foot.length) || sp.footTop) {
    foot = AL('v', { name: 'footer', gap: 10, pad: [12, PADX, 0, PADX], align: 'center' }); foot.resize(W, 10); foot.counterAxisSizingMode = 'FIXED'; foot.primaryAxisSizingMode = 'AUTO';
    if (sp.footTop) blocks(foot, sp.footTop, {});
    (sp.foot || []).forEach(function (x) { put(foot, button(x[0], x[1], { to: x[2], icon: x[3], disabled: x[4] }), 'fill'); });
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
  sh.topLeftRadius = 24; sh.topRightRadius = 24; sh.resize(W, 10); sh.counterAxisSizingMode = 'FIXED'; sh.primaryAxisSizingMode = 'AUTO';
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
