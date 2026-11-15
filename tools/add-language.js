// Adds the language switch to the exported design data (run after every export, like tools/copy-fixes.js):
//  - C05 Menu: a "Language" row right under "Appearance" (value shows the current language), opening C11
//  - C11 Language: a sheet cloned from C07 Appearance with two rows, English and Русский
// Idempotent. Light screens are patches against Dark, so the Light patches are shifted / extended to match.
const fs = require('fs');
const P = 'src/design/screens.json';
const s = JSON.parse(fs.readFileSync(P, 'utf8'));
const clone = x => JSON.parse(JSON.stringify(x));
const byCode = code => Object.values(s).find(x => x.name && x.name.split(' · ')[0] === code);

const C05 = byCode('C05'), C05L = byCode('C05L'), C07 = byCode('C07'), C07L = byCode('C07L');

// --- C05: Language row after Appearance ---------------------------------------------------------------
const group = C05.tree.c[2].c[1].c[0];
if (!group.c.some(r => (r.n || '').startsWith('row Language'))) {
  const ai = group.c.findIndex(r => (r.n || '').startsWith('row Appearance'));
  const row = clone(group.c[ai]);
  row.n = 'row Language → C11'; row.pd = 'C11'; delete row.to;
  row.c[0].c[0].ic = 'language';
  row.c[1].c[0].c[0].sg[0][0] = 'Language';
  row.c[2].c[0].sg[0][0] = 'English';
  group.c.splice(ai + 1, 0, row);
  // light patch of the same list: shift entries after Appearance by one, copy Appearance's patch for the new row
  const lp = C05L.patch.c[2].c[1].c[0].c;
  const keys = Object.keys(lp).filter(k => k !== '~').map(Number).sort((a, b) => b - a);
  for (const k of keys) if (k > ai) { lp[k + 1] = lp[k]; delete lp[k]; }
  if (lp[ai]) {
    const r = clone(lp[ai]); delete r.to;
    const lab = r.c && r.c[1] && r.c[1].c && r.c[1].c[0] && r.c[1].c[0].c && r.c[1].c[0].c[0];
    if (lab && lab.sg) lab.sg[0][0] = 'Language';
    const val = r.c && r.c[2] && r.c[2].c && r.c[2].c[0];
    if (val && val.sg) val.sg[0][0] = 'English';
    lp[ai + 1] = r;
  }
}

// --- C11: Language sheet --------------------------------------------------------------------------------
const ID = 'nvxo:C11', IDL = 'nvxo:C11L';
const badge = (label, color) => ({ z: 'HH', t: 'T', sg: [[label, 'SemiBold', 14, color]] });
const tree = clone(C07.tree);
tree.c[0].ref = 'C05';
const sheet = tree.c[2];
sheet.c[1].c[0].sg[0][0] = 'Language';
const tpl = sheet.c[2].c[0].c[1]; // the plain "Dark" row (no sub-label)
const mk = (label, code) => {
  const r = clone(tpl);
  r.n = `row ${label} → back`;
  r.c[0].c[0] = badge(code, r.c[0].c[0].f || '#58F9B0');
  r.c[1].c[0].c[0].sg[0][0] = label;
  return r;
};
sheet.c[2].c[0].c = [mk('English', 'EN'), mk('Русский', 'RU')];
s[ID] = { id: ID, name: 'C11 · Language', tree };

const lpatch = clone(C07L.patch);
const sp = lpatch.c[2];
if (sp.c[1] && sp.c[1].c[0] && sp.c[1].c[0].sg) sp.c[1].c[0].sg[0][0] = 'Language';
const rows = sp.c[2].c[0].c;
const rowPatch = (label, code) => {
  const r = clone(rows[1]);
  const icon = r.c[0].c[0];
  r.c[0].c[0] = { sg: [[code, 'SemiBold', 14, icon.f || '#000000']] };
  r.c[1].c[0].c[0].sg[0][0] = label;
  r.c[2] = { f: r.c[2].f }; // selection icon colour only; the app decides which row is checked
  return r;
};
sp.c[2].c[0].c = { 0: rowPatch('English', 'EN'), 1: rowPatch('Русский', 'RU'), '~': 1 };
s[IDL] = { id: IDL, name: 'C11L · Language', base: ID, patch: lpatch };

fs.writeFileSync(P, JSON.stringify(s));
console.log('language switch added: C05 row + C11 sheet');
