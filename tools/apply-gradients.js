// Applies the Figma gradient pass (tools/figma-gradients.js) and the audit-v2 link fixes to an existing export,
// using the per-screen records saved from Figma (design/gradients-oct1.txt), so 552 screens need no re-export.
// Usage: node tools/apply-gradients.js <exportDir> [baseDir]   (reads/writes screens.json in place)
// Build 3: only the 52px primary/buy button gradient ('v', h>=48) is kept; background glows and card/badge
// gradients are dropped. Screens that differ from <baseDir> were re-exported from Figma and are left untouched.
const fs = require('fs'), path = require('path');
const DIR = process.argv[2];
const sc = JSON.parse(fs.readFileSync(path.join(DIR, 'screens.json'), 'utf8'));
const rec = {};
fs.readFileSync(path.join(__dirname, '../design/gradients-oct1.txt'), 'utf8').split(';').forEach(e => {
  const [id, v] = e.split('='); rec[id] = v ? v.split(',').map(x => { const i = x.lastIndexOf(':'); return [x.slice(0, i), x.slice(i + 1)]; }) : [];
});
const VERT = k => [[0, Math.round(1000 / k) / 1000, 0], [-1, 0, 1]];
const DIAG = [[0.5, 0.5, 0], [-0.5, 0.5, 0.5]];
const P = {
  g: { g: [[0, '#FFFFFF', 0.06], [1, '#FFFFFF', 0]], m: VERT(0.45), o: 1 },
  G: { g: [[0, '#58F9B0', 0.12], [1, '#58F9B0', 0]], m: VERT(0.4), o: 1 },
  h: { g: [[0, '#1E2028', 1], [1, '#121318', 1]], m: DIAG, o: 1 },
  H: { g: [[0, '#FAFAFC', 1], [1, '#ECECF2', 1]], m: DIAG, o: 1 },
  m: { g: [[0, '#8CFCCB', 1], [1, '#58F9B0', 1]], m: DIAG, o: 1 },
  v: { g: [[0, '#86FCC8', 1], [1, '#58F9B0', 1]], m: VERT(1), o: 1 },
};
const BASE = { m: ['#58F9B0'], v: ['#58F9B0'], h: ['#121318'], H: ['#F2F2F7'] };
function merge(b, p) {
  if (p === undefined) return b; if (p === null) return undefined;
  if (Array.isArray(p) || typeof p !== 'object') return p;
  if (p['~'] === 1 && Array.isArray(b)) return b.map((x, i) => (i in p ? merge(x, p[i]) : x));
  if (!b || typeof b !== 'object' || Array.isArray(b)) return p;
  const o = { ...b }; for (const k in p) { const v = merge(b[k], p[k]); if (v === undefined) delete o[k]; else o[k] = v; } return o;
}
// identical to tools/figma-export.js
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function diff(a, b) {
  if (same(a, b)) return undefined;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length === b.length && a.every(x => x && typeof x === 'object' && !Array.isArray(x)) && b.every(x => x && typeof x === 'object' && !Array.isArray(x))) {
      const o = { '~': 1 }; a.forEach((x, i) => { const d = diff(x, b[i]); if (d !== undefined) o[i] = d; }); return o;
    }
    return b;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    if (a.t !== b.t) return b;
    const o = {}; for (const k in b) { const d = diff(a[k], b[k]); if (d !== undefined) o[k] = d; } for (const k in a) if (!(k in b)) o[k] = null; return o;
  }
  return b;
}
const clone = x => JSON.parse(JSON.stringify(x));
const bad = [];
const ONLY = new Set((process.env.ONLY || 'v').split(','));
const MINH = +(process.env.MINH || 48);
function apply(tree, list, label) {
  for (const [p, k] of list) {
    if (!ONLY.has(k)) continue;
    if (p === '') { const base = Array.isArray(tree.f) ? tree.f[0] : tree.f; tree.f = [base, P[k]]; continue; }
    let n = tree; for (const i of p.split('.')) { n = n && n.c && n.c[+i]; }
    const f0 = n && n.f && n.f[0];
    if (!n || !(n.t === 'F' || n.t === 'E') || typeof f0 !== 'string' || !BASE[k].includes(f0)) { bad.push(label + ' ' + p + ' ' + k + ' got ' + (n ? n.t + ' ' + JSON.stringify(n.f) : 'none')); continue; }
    if (k === 'v' && n.h < MINH) continue;
    n.f = [P[k]];
  }
}
// ---- audit-v2 link fixes (dark id, glyph, target code) ----
const codeOf = s => s.name.split(' · ')[0];
const darkByCode = {}, lightOf = {};
for (const id in sc) { const s = sc[id]; if (!s.base) darkByCode[codeOf(s)] = id; else lightOf[s.base] = id; }
const LINKS = [[['F21', 'O03', 'Q02'], 'calendar_today', 'Z10'], [['E01', 'E02', 'E08'], 'more_horiz', 'E15'], [['G05', 'R05'], 'attach_file', 'Z09'], [['G02'], 'gavel', 'R02'], [['I02'], 'info_outline', 'I09']];
const linkFix = {}; // darkId -> [[glyph, code]]
LINKS.forEach(([codes, g, to]) => codes.forEach(c => (linkFix[darkByCode[c]] = linkFix[darkByCode[c]] || []).push([g, to])));
function fixLinks(tree, list, light) {
  let n = 0;
  (function w(x) {
    if (x.t === 'I') for (const [g, to] of list) if (x.ic === g) {
      const dest = light ? lightOf[darkByCode[to]] : darkByCode[to];
      x.to = dest; x.pd = to; x.n = 'icon/' + g + ' → ' + to; n++;
    }
    (x.c || []).forEach(w);
  })(tree);
  return n;
}
// ---- run ----
const NEW = new Set(['2712:1047', '2712:1310', '2712:1383', '2712:1443', '2713:2305', '2713:2780', '2713:2855', '2713:2102']);
if (process.argv[3]) { // skip everything that was re-exported (already carries Figma's current fills and links)
  const base = JSON.parse(fs.readFileSync(path.join(process.argv[3], 'screens.json'), 'utf8'));
  for (const id in sc) if (!base[id] || JSON.stringify(base[id]) !== JSON.stringify(sc[id])) { NEW.add(id); if (sc[id].base) NEW.add(sc[id].base); }
  for (const id in sc) if (sc[id].base && NEW.has(sc[id].base)) NEW.add(id);
}
let dn = 0, ln = 0, links = 0;
for (const id in sc) {
  const s = sc[id]; if (s.base || NEW.has(id)) continue;
  const lid = lightOf[id], ls = lid && sc[lid];
  const lightTree = ls ? merge(clone(s.tree), ls.patch) : null;
  const dark = clone(s.tree);
  apply(dark, rec[id] || [], codeOf(s)); dn += (rec[id] || []).length;
  if (linkFix[id]) links += fixLinks(dark, linkFix[id], false);
  if (lightTree) {
    apply(lightTree, rec[lid] || [], codeOf(ls)); ln += (rec[lid] || []).length;
    if (linkFix[id]) links += fixLinks(lightTree, linkFix[id], true);
    ls.patch = diff(dark, lightTree) || {};
  }
  s.tree = dark;
}
fs.writeFileSync(path.join(DIR, 'screens.json'), JSON.stringify(sc));
console.log({ dark: dn, light: ln, links, bad: bad.length });
bad.slice(0, 20).forEach(b => console.log('  ', b));
