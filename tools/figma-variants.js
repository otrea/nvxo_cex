// Variant engine: builds content-state screens (filters, tabs, sides) by cloning an existing screen
// and applying declarative ops. Runs identically on the Dark page and on the Light page (codes + 'L').
// Stored in shared plugin data nvxo/var_lib; loaded with  await new AF('figma', LIB)(figma)
// Spec: { src, code, name, ops: [[op, ...args]] }   Family: { codes: { label: code }, group: [labels] }
const W = 393;
const SCREEN_RE = /^([A-Z]\d\d[a-z]*L?|DS\d) · /;
const THEME = {
  dark: { fg: '#FFFFFF', mut: '#7C7D86', card2: '#1C1D24', neg: '#FF4D5E', onNeg: '#FFFFFF', mint: '#58F9B0', onMint: '#000000' },
  light: { fg: '#000019', mut: '#6B6B78', card2: '#E8E8EE', neg: '#E5374A', onNeg: '#FFFFFF', mint: '#58F9B0', onMint: '#000000' },
};
const hex = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const toHex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const SOLID = h => [{ type: 'SOLID', color: hex(h) }];
const isIcon = n => n.type === 'TEXT' && n.fontName !== figma.mixed && n.fontName.family === 'Material Icons Round';
let T = THEME.dark, SUF = '', FRAMES = {};

async function fonts() {
  for (const s of ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'ExtraBold']) await figma.loadFontAsync({ family: 'SUSE', style: s });
  for (const s of ['Regular', 'Medium', 'SemiBold']) await figma.loadFontAsync({ family: 'SUSE Mono', style: s });
  await figma.loadFontAsync({ family: 'Material Icons Round', style: 'Regular' });
}
function index(page) {
  FRAMES = {};
  page.findAll(n => n.type === 'FRAME' && n.parent && n.parent.type === 'SECTION' && SCREEN_RE.test(n.name)).forEach(f => { FRAMES[f.name.split(' · ')[0]] = f; });
}
const frameOf = code => FRAMES[code + SUF];
// nodes of the screen itself, never inside a cloned background screen
function own(frame, pred) {
  const out = [];
  (function w(n) { for (const c of ('children' in n ? n.children : [])) { if (c.type === 'FRAME' && SCREEN_RE.test(c.name)) continue; if (pred(c)) out.push(c); w(c); } })(frame);
  return out;
}
const textsOf = n => { const o = []; (function w(x) { if (x.type === 'TEXT' && !isIcon(x)) o.push(x.characters); if ('children' in x) x.children.forEach(w); })(n); return o; };
const firstText = n => (n.type === 'TEXT' && !isIcon(n)) ? n : ('children' in n ? n.findOne(x => x.type === 'TEXT' && !isIcon(x)) : null);
const firstIcon = n => isIcon(n) ? n : ('children' in n ? n.findOne(x => isIcon(x)) : null);
function solid(n) { return n.fills && n.fills !== figma.mixed && n.fills.length && n.fills[0].type === 'SOLID' ? toHex(n.fills[0].color) : null; }

// ---------- group (chips / segments / tabs) ----------
function findGroup(frame, labels) {
  const set = new Set(labels);
  const cands = own(frame, n => n.type === 'FRAME' && n.children.length >= 2 && n.children.filter(c => c.type === 'FRAME').length >= 2);
  for (const p of cands) {
    const kids = p.children.filter(c => c.type === 'FRAME');
    const labs = kids.map(k => { const t = firstText(k); return t ? t.characters : null; });
    if (labs.filter(l => set.has(l)).length >= Math.min(labels.length, kids.length) && labs.every(l => l && set.has(l))) return { p, kids, labs };
  }
  return null;
}
function sig(k) { const t = firstText(k), r = k.children && k.children.find(c => c.type === 'RECTANGLE' && c.height <= 4); return JSON.stringify([solid(k), t && t.fills !== figma.mixed && t.fills[0] ? toHex(t.fills[0].color) : null, t && t.fontName, r ? [r.width, solid(r)] : null]); }
function activeOf(g) {
  const groups = {}; g.kids.forEach((k, i) => { const s = sig(k); (groups[s] = groups[s] || []).push(i); });
  const one = Object.values(groups).find(x => x.length === 1); return one ? one[0] : -1;
}
function swapStyle(a, b) {
  const fa = a.fills, fb = b.fills; a.fills = fb; b.fills = fa;
  const sa = a.strokes, sb = b.strokes; a.strokes = sb; b.strokes = sa;
  const ta = firstText(a), tb = firstText(b);
  if (ta && tb) { const f1 = ta.fills, f2 = tb.fills, n1 = ta.fontName, n2 = tb.fontName; ta.fills = f2; tb.fills = f1; ta.fontName = n2; tb.fontName = n1; }
  const ia = firstIcon(a), ib = firstIcon(b);
  if (ia && ib) { const f1 = ia.fills; ia.fills = ib.fills; ib.fills = f1; }
  const ra = a.children && a.children.find(c => c.type === 'RECTANGLE' && c.height <= 4), rb = b.children && b.children.find(c => c.type === 'RECTANGLE' && c.height <= 4);
  if (ra && rb) { const w1 = ra.width, w2 = rb.width, f1 = ra.fills; ra.resize(w2, ra.height); rb.resize(w1, rb.height); ra.fills = rb.fills; rb.fills = f1; }
}
function act(frame, labels, label) {
  const g = findGroup(frame, labels); if (!g) throw new Error('group not found ' + labels.join('/'));
  const a = activeOf(g), b = g.labs.indexOf(label);
  if (a < 0) throw new Error('no active in ' + labels.join('/'));
  if (b >= 0 && a !== b) swapStyle(g.kids[a], g.kids[b]);
}

// ---------- rows ----------
function findList(frame, hint) {
  const t = own(frame, n => n.type === 'TEXT' && n.characters.indexOf(hint) >= 0)[0]; if (!t) throw new Error('hint not found ' + hint);
  let n = t;
  while (n.parent && n.parent !== frame) {
    const p = n.parent;
    if (p.type === 'FRAME' && p.layoutMode === 'VERTICAL' && p.children.filter(c => c.type === 'FRAME' || c.type === 'INSTANCE').length >= 2) return p;
    n = p;
  }
  throw new Error('list not found ' + hint);
}
const isDivider = n => n.type === 'RECTANGLE' && n.height <= 1.5;
function tidy(list) {
  let prevDiv = true;
  for (const c of [...list.children]) { if (isDivider(c)) { if (prevDiv) c.remove(); else prevDiv = true; } else prevDiv = false; }
  const last = list.children[list.children.length - 1]; if (last && isDivider(last)) last.remove();
}
function keep(frame, hint, subs, header) {
  const list = findList(frame, hint);
  for (const c of [...list.children]) {
    if (isDivider(c)) continue;
    const tx = textsOf(c).join('|');
    if (header && header.some(h => tx.indexOf(h) >= 0)) continue;
    if (!subs.some(s => tx.indexOf(s) >= 0)) c.remove();
  }
  tidy(list);
  return list;
}
function order(frame, hint, subs) {
  const list = findList(frame, hint);
  const rows = list.children.filter(c => !isDivider(c) && subs.some(s => textsOf(c).join('|').indexOf(s) >= 0));
  const firstIdx = list.children.indexOf(rows[0]);
  const divs = list.children.filter(isDivider).map(d => d);
  subs.forEach(s => { const r = rows.find(x => textsOf(x).join('|').indexOf(s) >= 0); if (r) list.appendChild(r); });
  // re-insert dividers between rows if the list uses them
  if (divs.length) { divs.forEach(d => d.remove()); const rs = list.children.filter(c => rows.includes(c)); rs.slice(1).forEach(r => { const d = divs.pop(); if (d) list.insertChild(list.children.indexOf(r), d); }); }
  return firstIdx;
}
function rowsFrom(frame, hint, srcCode, subs) {
  const list = findList(frame, hint);
  const src = frameOf(srcCode); if (!src) throw new Error('no src ' + srcCode);
  const slist = findList(src, subs[0]);
  const div = list.children.find(isDivider);
  for (const s of subs) {
    const r = slist.children.find(c => !isDivider(c) && textsOf(c).join('|').indexOf(s) >= 0);
    if (!r) throw new Error('row not found ' + s);
    if (div) list.appendChild(div.clone());
    list.appendChild(r.clone());
  }
}
// ---------- texts / styles ----------
function text(frame, pairs) {
  const nodes = own(frame, n => n.type === 'TEXT' && !isIcon(n));
  for (const p of pairs) {
    const [a, b, nth] = p; let k = 0, hit = 0;
    for (const t of nodes) {
      if (t.characters === a) { if (nth == null || k === nth) { t.characters = b; hit++; } k++; }
      else if (p[3] === 'sub' && t.characters.indexOf(a) >= 0) {
        // range edit keeps mixed styles (e.g. bold "BTC" + grey "/USDT")
        let i; while ((i = t.characters.indexOf(a)) >= 0) { t.insertCharacters(i + a.length, b, 'BEFORE'); t.deleteCharacters(i, i + a.length); }
        hit++;
      }
    }
    if (!hit) throw new Error('text not found: ' + a);
  }
}
function icon(frame, from, to) { own(frame, n => isIcon(n) && n.characters === from).forEach(n => { n.characters = to; }); }
function btn(frame, label, newLabel, kind) {
  const ts = own(frame, n => n.type === 'TEXT' && !isIcon(n) && n.characters === label);
  for (const t of ts) {
    let b = t.parent; if (!b || b.type !== 'FRAME' || !/^button\//.test(b.name)) continue;
    if (newLabel) t.characters = newLabel;
    if (kind === 'sell') { b.fills = SOLID(T.neg); t.fills = SOLID(T.onNeg); }
    if (kind === 'primary') { b.fills = SOLID(T.mint); t.fills = SOLID(T.onMint); }
  }
  if (!ts.length) throw new Error('button not found ' + label);
}
function pills(frame) {
  own(frame, n => n.type === 'FRAME' && n.children.length === 1 && n.children[0].type === 'TEXT' && /^[+\-−]\d[\d.,]*%$/.test(n.children[0].characters) && !!solid(n)).forEach(p => {
    const neg = /^[-−]/.test(p.children[0].characters);
    p.fills = SOLID(neg ? T.neg : T.mint); p.children[0].fills = SOLID(neg ? T.onNeg : T.onMint);
  });
}
function removeText(frame, label, up) {
  const t = own(frame, n => n.type === 'TEXT' && !isIcon(n) && n.characters === label)[0]; if (!t) throw new Error('remove: not found ' + label);
  let n = t; for (let i = 0; i < (up || 1); i++) n = n.parent; n.remove();
}
function empty(frame, hint, ic, title, sub) {
  // replace the rows of a list (or the card containing hint) by an empty state
  const t = own(frame, n => n.type === 'TEXT' && n.characters.indexOf(hint) >= 0)[0]; if (!t) throw new Error('empty: hint ' + hint);
  const content = frame.children.find(c => c.name === 'content');
  let n = t; while (n.parent !== content) n = n.parent;
  const idx = content.children.indexOf(n); n.remove();
  const box = figma.createAutoLayout('VERTICAL', { name: 'empty state', itemSpacing: 12, paddingTop: 48, paddingBottom: 48 });
  box.counterAxisAlignItems = 'CENTER'; box.fills = [];
  const circ = figma.createAutoLayout('HORIZONTAL', { name: 'icon-circle' }); circ.resize(64, 64); circ.primaryAxisSizingMode = 'FIXED'; circ.counterAxisSizingMode = 'FIXED';
  circ.primaryAxisAlignItems = 'CENTER'; circ.counterAxisAlignItems = 'CENTER'; circ.cornerRadius = 32; circ.fills = SOLID(T.card2);
  const i = figma.createText(); i.fontName = { family: 'Material Icons Round', style: 'Regular' }; i.characters = ic; i.fontSize = 30; i.fills = SOLID(T.mut); circ.appendChild(i);
  const h = figma.createText(); h.fontName = { family: 'SUSE', style: 'SemiBold' }; h.characters = title; h.fontSize = 17; h.fills = SOLID(T.fg); h.textAlignHorizontal = 'CENTER';
  const s = figma.createText(); s.fontName = { family: 'SUSE', style: 'Regular' }; s.characters = sub; s.fontSize = 14; s.fills = SOLID(T.mut); s.textAlignHorizontal = 'CENTER'; s.lineHeight = { unit: 'PIXELS', value: 20 };
  box.appendChild(circ); box.appendChild(h); box.appendChild(s);
  content.insertChild(idx, box); box.layoutSizingHorizontal = 'FILL';
  s.textAutoResize = 'HEIGHT'; s.resize(300, s.height);
}
function over(frame, srcCode) {
  // sheet screens: swap the cloned background screen for another one
  const old = frame.children.find(c => c.type === 'FRAME' && SCREEN_RE.test(c.name)); if (!old) throw new Error('no background');
  const idx = frame.children.indexOf(old); old.remove();
  const nb = frameOf(srcCode).clone(); frame.insertChild(idx, nb); nb.x = 0; nb.y = 0;
}
function link(frame, label, code, up) {
  const ts = own(frame, n => (n.type === 'TEXT') && n.characters === label); if (!ts.length) throw new Error('link: not found ' + label);
  const linkedUp = x => { let a = x; while (a && a !== frame && !a.getSharedPluginData('nvxo', 'to')) a = a.parent; return a && a !== frame; };
  const t = ts.find(linkedUp) || ts[0];
  let n = t; for (let i = 0; i < (up || 0); i++) n = n.parent;
  // prefer an already linked ancestor (row, button)
  let a = n; while (a && a !== frame && !a.getSharedPluginData('nvxo', 'to')) a = a.parent; if (a && a !== frame) n = a;
  n.setSharedPluginData('nvxo', 'to', code); n.name = n.name.replace(/ → .*$/, '') + ' → ' + code;
}
function linkAll(frame, label, code) {
  own(frame, n => n.type === 'TEXT' && n.characters === label).forEach(t => {
    let a = t; while (a && a !== frame && !a.getSharedPluginData('nvxo', 'to')) a = a.parent;
    const n = a && a !== frame ? a : t.parent;
    n.setSharedPluginData('nvxo', 'to', code); n.name = n.name.replace(/ → .*$/, '') + ' → ' + code;
  });
}
function fit(frame) {
  const content = frame.children.find(c => c.name === 'content'); if (!content) return;
  const tab = frame.children.find(c => c.name === 'tab bar'), foot = frame.children.find(c => c.name === 'footer'), hi = frame.children.find(c => c.name === 'home indicator');
  const need = content.y + content.height + (foot ? foot.height + 16 : 0) + (tab ? 84 : 34);
  const H = Math.max(852, Math.ceil(need)); frame.resize(W, H);
  if (tab) tab.y = H - 84;
  if (foot) foot.y = H - (tab ? 84 + 12 : 34) - foot.height;
  if (hi) hi.y = H - 13;
}
function dup(frame, hint, fromSub, pairs, coin) {
  // clone the row containing fromSub, re-text it, and optionally give it a letter coin (brand colour + letter)
  const list = findList(frame, hint);
  const r = list.children.find(c => !isDivider(c) && textsOf(c).join('|').indexOf(fromSub) >= 0); if (!r) throw new Error('dup: no ' + fromSub);
  const c = r.clone(); list.appendChild(c);
  const nodes = []; (function w(x) { if (x.type === 'TEXT' && !isIcon(x)) nodes.push(x); if ('children' in x) x.children.forEach(w); })(c);
  for (const [a, b] of pairs) { const t = nodes.find(n => n.characters.indexOf(a) >= 0); if (!t) throw new Error('dup text ' + a); const i = t.characters.indexOf(a); t.insertCharacters(i + a.length, b, 'BEFORE'); t.deleteCharacters(i, i + a.length); }
  if (coin) {
    const srcRow = list.children.find(x => !isDivider(x) && textsOf(x).join('|').indexOf(coin.from) >= 0);
    const letter = srcRow && srcRow.findOne(x => x.type === 'FRAME' && x.children.length === 1 && x.children[0].type === 'TEXT' && x.children[0].characters.length === 1);
    const old = c.findOne(x => (x.type === 'INSTANCE' && /^coin\//.test(x.name)) || (x.type === 'FRAME' && x.children.length === 1 && x.children[0].type === 'TEXT' && x.children[0].characters.length === 1));
    if (!letter || !old) throw new Error('dup coin');
    const nc = letter.clone(); old.parent.insertChild(old.parent.children.indexOf(old), nc); old.remove();
    nc.fills = SOLID(coin.color); nc.children[0].characters = coin.letter; nc.children[0].fills = SOLID('#FFFFFF');
  }
  const div = list.children.find(isDivider); if (div) list.insertChild(list.children.indexOf(c), div.clone());
}
const OPS = { dup, act, keep, order, rowsFrom, text, icon, btn, pills, removeText, empty, over, link, linkAll, fit };

async function build(pageId, theme, specs) {
  const page = await figma.getNodeByIdAsync(pageId); await figma.setCurrentPageAsync(page);
  await fonts(); T = THEME[theme]; SUF = theme === 'light' ? 'L' : ''; index(page);
  const out = [], errs = [];
  for (const sp of specs) {
    if (sp.patch) {
      const f = frameOf(sp.patch); if (!f) { errs.push('missing ' + sp.patch + SUF); continue; }
      for (const o of sp.ops || []) { try { OPS[o[0]](f, ...o.slice(1)); } catch (e) { errs.push(sp.patch + ' ' + o[0] + ': ' + e.message); } }
      out.push(sp.patch + SUF + ' patched'); continue;
    }
    if (frameOf(sp.code)) { out.push(sp.code + SUF + ' exists'); continue; }
    const src = frameOf(sp.src); if (!src) { errs.push('missing ' + sp.src + SUF); continue; }
    const f = src.clone(); f.name = sp.code + SUF + ' · ' + sp.name;
    const sec = src.parent; let x = 120; sec.children.forEach(k => { if (k.type === 'FRAME') x = Math.max(x, k.x + k.width + 100); });
    sec.appendChild(f); f.x = x; f.y = 160; if (sec.width < x + 520) sec.resizeWithoutConstraints(x + 520, Math.max(sec.height, f.height + 320));
    FRAMES[sp.code + SUF] = f;
    for (const o of sp.ops || []) { try { OPS[o[0]](f, ...o.slice(1)); } catch (e) { errs.push(sp.code + ' ' + o[0] + ': ' + e.message); } }
    try { fit(f); } catch (e) {}
    out.push(sp.code + SUF + '=' + f.id);
  }
  return { out, errs };
}
// relink chip groups and set prototype reactions for every coded link in the given screens
async function wire(pageId, theme, families, extra) {
  const page = await figma.getNodeByIdAsync(pageId); await figma.setCurrentPageAsync(page);
  T = THEME[theme]; SUF = theme === 'light' ? 'L' : ''; index(page);
  const touched = new Set(extra || []), errs = [], clear = [];
  for (const fam of families) {
    const own2 = Object.values(fam.codes).concat(fam.also || []);
    for (const code of own2.filter((c, i) => own2.indexOf(c) === i)) {
      const f = frameOf(code); if (!f) { errs.push('no ' + code); continue; }
      const g = findGroup(f, fam.group); if (!g) { errs.push('no group in ' + code); continue; }
      g.kids.forEach((k, i) => {
        const target = fam.codes[g.labs[i]];
        if (!target) return;
        if (target === code) { k.setSharedPluginData('nvxo', 'to', ''); k.name = k.name.replace(/ → .*$/, ''); clear.push(k); }
        else { k.setSharedPluginData('nvxo', 'to', target); k.name = k.name.replace(/ → .*$/, '') + ' → ' + target; }
      });
      touched.add(code);
    }
  }
  let rx = 0;
  for (const k of clear) await k.setReactionsAsync([]);
  for (const code of touched) {
    const f = frameOf(code); if (!f) continue;
    for (const n of own(f, x => 'setReactionsAsync' in x)) {
      const to = n.getSharedPluginData('nvxo', 'to');
      if (!to) continue;
      if (to === 'back') { await n.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'BACK' }] }]); rx++; continue; }
      if (to === 'self' || to === 'toast') { await n.setReactionsAsync([]); continue; }
      const d = frameOf(to); if (!d) { errs.push(code + ' → missing ' + to); continue; }
      await n.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: d.id, navigation: 'NAVIGATE', transition: null, preserveScrollPosition: false }] }]); rx++;
    }
  }
  return { rx, touched: touched.size, errs };
}
async function shot(pageId, codes, theme, scale) {
  const page = await figma.getNodeByIdAsync(pageId); await figma.setCurrentPageAsync(page);
  SUF = theme === 'light' ? 'L' : ''; index(page);
  const tmp = figma.createFrame(); tmp.fills = []; tmp.x = -20000; tmp.y = -20000; tmp.layoutMode = 'HORIZONTAL'; tmp.itemSpacing = 16; tmp.primaryAxisSizingMode = 'AUTO'; tmp.counterAxisSizingMode = 'AUTO';
  for (const c of codes) { const f = frameOf(c); if (f) tmp.appendChild(f.clone()); }
  await tmp.screenshot({ scale: scale || 0.4 }); tmp.remove();
}
return { build, wire, shot };
