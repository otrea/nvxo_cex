// Collects every user-visible English string (design text segments, field placeholders/values, strings set in code)
// into i18n/en.json — the list tools/i18n-build.js checks the Russian dictionary against.
const fs = require('fs');
const s = require('../src/design/screens.json');
const out = new Map();
const add = (t, where) => { if (typeof t !== 'string' || !/[a-z]{2}/.test(t)) return; if (!out.has(t)) out.set(t, where); };
function walk(n, where) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) { n.forEach(x => walk(x, where)); return; }
  if (Array.isArray(n.sg)) for (const g of n.sg) if (Array.isArray(g)) add(g[0], where);
  if (n.in) { add(n.in.ph, where); add(n.in.v, where); }
  for (const k in n) if (n[k] && typeof n[k] === 'object') walk(n[k], where);
}
for (const [id, x] of Object.entries(s)) walk(x.tree || x.patch, (x.name || id).split(' · ')[0]);
// strings the app code puts on screen (toasts, empty states)
for (const f of ['src/render/Screen.tsx', 'src/render/interact.ts', 'src/render/transform.ts']) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:toast|msg|title|body|ph|label)\s*[:(=]\s*'([^']*[a-z]{2}[^']*)'/g)) add(m[1], 'code');
  for (const m of src.matchAll(/'((?:[A-Z][a-z]+|No|All|Tap|Try|Enter)(?: [^']+)+)'/g)) add(m[1], 'code');
}
const list = [...out.entries()].map(([en, at]) => ({ en, at }));
fs.writeFileSync('i18n/en.json', JSON.stringify(list, null, 0).replace(/},{/g, '},\n{'));
console.log('strings', list.length, 'chars', list.reduce((a, x) => a + x.en.length, 0));
