// The exporter wrote Figma's MIN and MAX alignment both as 'M' (dropped). tools/max-align.json lists, per Dark screen,
// the exported-tree paths of auto-layout frames with MAX primary (P) / counter (C) alignment; mark them 'X'.
const fs = require('fs'); const P = 'src/design/screens.json';
const s = JSON.parse(fs.readFileSync(P, 'utf8')); const M = require('./max-align.json'); let ok = 0, bad = [];
for (const [id, list] of Object.entries(M)) for (const p of list) {
  const m = /^([\d.]+)(P?)(C?)$/.exec(p); let n = s[id].tree;
  for (const i of m[1].split('.').map(Number)) n = n && n.c && n.c[i];
  if (!n || n.t !== 'F' || !n.lm) { bad.push(id + ' ' + p); continue; }
  if (m[2]) n.pa = 'X'; if (m[3]) n.ca = 'X'; ok++;
}
fs.writeFileSync(P, JSON.stringify(s)); console.log('patched', ok, 'bad', bad.length, bad.slice(0, 10));
