// Flow audit over the exported design: dead-end tappables, 'self' links, orphans, exits.
const sc = require('../src/design/screens.json');
const dark = Object.values(sc).filter(s => !s.base);
const code = s => s.name.split(' · ')[0];
const byId = {}; dark.forEach(s => byId[s.id] = s);
const MINT = '#58F9B0', NEG = ['#FF4D5E', '#E5374A'];
const fill = n => { const f = n.f; if (!f) return null; const p = Array.isArray(f) && !(f.length === 2 && typeof f[1] === 'number') ? f[0] : f; return typeof p === 'string' ? p : Array.isArray(p) ? p[0] : 'grad'; };
const texts = n => { const o = []; (function w(x) { if (x.t === 'T') o.push(x.sg.map(s => s[0]).join('')); if (x.t === 'I') o.push('[' + x.ic + ']'); (x.c || []).forEach(w); })(n); return o; };
const icons = n => { const o = []; (function w(x) { if (x.t === 'I') o.push(x.ic); (x.c || []).forEach(w); })(n); return o; };
const linked = n => !!(n.to || n.pd);
const dead = [], selfs = [], toasts = [];
function kind(n, ctx) {
  const tx = texts(n), ic = icons(n);
  if (n.t === 'F') {
    const f = fill(n);
    const hasT = (n.c || []).some(c => c.t === 'T' || (c.t === 'F' && (c.c || []).some(d => d.t === 'T')));
    if (n.lm === 'H' && n.h >= 36 && n.h <= 60 && n.w >= 70 && hasT && (f === MINT || NEG.includes(f) || (n.s && !f)) && n.r >= 8 && tx.length <= 3 && !ic.includes('search')) return 'button';
    if (n.lm === 'H' && ic.includes('chevron_right') && n.w > 200) return 'row';
    if (n.lm === 'H' && (ic.includes('expand_more') || ic.includes('keyboard_arrow_down')) && n.h >= 40) return 'dropdown';
    if (n.lm === 'H' && n.h >= 36 && n.h <= 44 && n.w <= 44 && n.r >= 16 && ic.length === 1 && ctx.inHeader) return 'header-icon';
  }
  if (n.t === 'I' && ctx.inHeader && !ctx.inLinked) return 'header-icon';
  if (n.t === 'T' && n.sg.length === 1 && n.sg[0][3] === MINT && n.sg[0][0].length < 40 && !ctx.onMint && /[a-z]/.test(n.sg[0][0]) && ctx.parentFill !== MINT) return 'text-link';
  return null;
}
function walk(n, s, ctx) {
  if (linked(n)) {
    if (n.pd === 'self') selfs.push([code(s), n.n]);
    if (n.pd === 'toast') toasts.push([code(s), n.n]);
  }
  const k = !ctx.inLinked && !linked(n) ? kind(n, ctx) : null;
  if (k) { dead.push([code(s), k, texts(n).join(' | ').slice(0, 70)]); if (k !== 'header-icon' || n.t === 'F') return; }
  const f = n.t === 'F' ? fill(n) : null;
  const c2 = { inLinked: ctx.inLinked || linked(n), inHeader: ctx.inHeader || n.n === 'header', onMint: ctx.onMint || f === MINT, parentFill: f || ctx.parentFill, inTab: ctx.inTab || n.n === 'tab bar' };
  (n.c || []).forEach(c => walk(c, s, c2));
}
dark.forEach(s => walk(s.tree, s, {}));
// reachability
const inc = {}; const out = {};
const target = (n) => n.to && n.to !== 'back' ? (byId[n.to] ? n.to : null) : null;
dark.forEach(s => { out[s.id] = new Set(); (function w(n) { const t = target(n); if (t) { out[s.id].add(t); (inc[t] = inc[t] || new Set()).add(code(s)); } if (n.auto) { (inc[n.auto[0]] = inc[n.auto[0]] || new Set()).add(code(s)); } (n.c || []).forEach(w); })(s.tree); });
const orphans = dark.filter(s => !inc[s.id] && code(s) !== 'A01').map(s => s.name);
const noExit = dark.filter(s => { let back = false; (function w(n) { if (n.to === 'back' || n.pd === 'back') back = true; (n.c || []).forEach(w); })(s.tree); return !back && out[s.id].size === 0 && !s.tree.auto; }).map(s => s.name);
const mode = process.argv[2] || 'summary';
if (mode === 'json') { console.log(JSON.stringify({ dead, selfs, toasts, orphans, noExit }, null, 1)); return; }
const cnt = {}; dead.forEach(d => cnt[d[1]] = (cnt[d[1]] || 0) + 1);
console.log('DEAD', dead.length, cnt, 'screens with dead', new Set(dead.map(d => d[0])).size);
console.log('SELF', selfs.length, 'TOAST', toasts.length, 'ORPHANS', orphans.length, 'NOEXIT', noExit.length);
