// Collect EXPB slices from the session transcript, decompress, write src/design/*.json
const fs = require('fs'), path = require('path');
const LZ = require(process.env.LZ || "/tmp/claude-0/-home-claude/c5a968d4-6539-5592-a34d-b4f4bcdb28ad/scratchpad/lz/node_modules/lz-string");
const T = process.argv[2]; const OUT = process.argv[3];
const batches = {};
// EXPB = lz-string base64 (old driver), EXPZ = raw deflate base64 (drv2)
const add = (z, bn, sl, n, data) => { if (+bn < +(process.env.MIN_BN || 0)) return; (batches[bn] = batches[bn] || { n: +n, z, s: {} }).s[sl] = data; };
const take = txt => { const re = /EXP([BZ])\|(\d+)\|(\d+)\|(\d+)\|([A-Za-z0-9+/=]+)/g; let m; while ((m = re.exec(txt))) add(m[1] === 'Z', m[2], m[3], m[4], m[5]); };
// large tool results are saved next to the transcript instead of inline
const TR = T.replace(/\.jsonl$/, '') + '/tool-results';
if (fs.existsSync(TR)) for (const f of fs.readdirSync(TR)) { const t = fs.readFileSync(path.join(TR, f), 'utf8'); if (/EXP[BZ]\|/.test(t)) take(t); }
for (const line of fs.readFileSync(T, 'utf8').split('\n')) {
  if (!/EXP[BZ]\|/.test(line)) continue;
  let j; try { j = JSON.parse(line); } catch (e) { continue; }
  const c = j.message && j.message.content; if (!Array.isArray(c)) continue;
  for (const b of c) {
    if (b.type !== 'tool_result') continue;
    const parts = Array.isArray(b.content) ? b.content.map(x => x.text || '').join('') : String(b.content || '');
    take(parts);
  }
}
fs.mkdirSync(path.join(OUT, 'raw'), { recursive: true });
// raw slices are kept next to the output so a lost transcript never loses a collected slice
for (const bn in batches) for (const sl in batches[bn].s) fs.writeFileSync(path.join(OUT, 'raw', (batches[bn].z ? 'Z' : 'B') + bn + '_' + sl + '_' + batches[bn].n + '.txt'), batches[bn].s[sl]);
for (const f of fs.readdirSync(path.join(OUT, 'raw'))) { const m = /^([BZ])(\d+)_(\d+)_(\d+)\.txt$/.exec(f); if (m) add(m[1] === 'Z', m[2], m[3], m[4], fs.readFileSync(path.join(OUT, 'raw', f), 'utf8')); }
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { return {}; } };
// merge into existing output so a compacted transcript never loses earlier batches
const screens = rd('screens.json'), svg = rd('svg.json'); const missing = [];
for (const bn of Object.keys(batches).sort((a, b) => a - b)) {
  const B = batches[bn]; const parts = []; for (let i = 0; i < B.n; i++) { if (!B.s[i]) { missing.push(bn + ':' + i); } parts.push(B.s[i] || ''); }
  if (parts.some(p => !p)) continue;
  const txt = B.z ? require('zlib').inflateRawSync(Buffer.from(parts.join(''), 'base64')).toString('utf8') : LZ.decompressFromBase64(parts.join('')); if (!txt) { missing.push(bn + ':decode'); continue; }
  const r = JSON.parse(txt); Object.assign(svg, r.svg); for (const s of r.screens) screens[s.id] = s;
}
fs.writeFileSync(path.join(OUT, 'screens.json'), JSON.stringify(screens));
fs.writeFileSync(path.join(OUT, 'svg.json'), JSON.stringify(svg));
console.log('batches', Object.keys(batches).length, 'screens', Object.keys(screens).length, 'svg', Object.keys(svg).length, 'missing', missing.join(','));
