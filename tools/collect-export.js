// Collect EXPB slices from the session transcript, decompress, write src/design/*.json
const fs = require('fs'), path = require('path');
const LZ = require(process.env.LZ || '/tmp/claude-0/-home-claude/c5a968d4-6539-5592-a34d-b4f4bcdb28ad/scratchpad/lz/node_modules/lz-string');
const T = process.argv[2]; const OUT = process.argv[3];
const batches = {};
for (const line of fs.readFileSync(T, 'utf8').split('\n')) {
  if (!line.includes('EXPB|')) continue;
  let j; try { j = JSON.parse(line); } catch (e) { continue; }
  const c = j.message && j.message.content; if (!Array.isArray(c)) continue;
  for (const b of c) {
    if (b.type !== 'tool_result') continue;
    const parts = Array.isArray(b.content) ? b.content.map(x => x.text || '').join('') : String(b.content || '');
    const m = parts.match(/EXPB\|(\d+)\|(\d+)\|(\d+)\|([A-Za-z0-9+/=]+)/); if (!m) continue;
    const [_, bn, sl, n, data] = m; if (+bn < +(process.env.MIN_BN || 0)) continue; (batches[bn] = batches[bn] || { n: +n, s: {} }).s[sl] = data;
  }
}
fs.mkdirSync(OUT, { recursive: true });
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { return {}; } };
// merge into existing output so a compacted transcript never loses earlier batches
const screens = rd('screens.json'), svg = rd('svg.json'); const missing = [];
for (const bn of Object.keys(batches).sort((a, b) => a - b)) {
  const B = batches[bn]; const parts = []; for (let i = 0; i < B.n; i++) { if (!B.s[i]) { missing.push(bn + ':' + i); } parts.push(B.s[i] || ''); }
  if (parts.some(p => !p)) continue;
  const txt = LZ.decompressFromBase64(parts.join('')); if (!txt) { missing.push(bn + ':decode'); continue; }
  const r = JSON.parse(txt); Object.assign(svg, r.svg); for (const s of r.screens) screens[s.id] = s;
}
fs.writeFileSync(path.join(OUT, 'screens.json'), JSON.stringify(screens));
fs.writeFileSync(path.join(OUT, 'svg.json'), JSON.stringify(svg));
console.log('batches', Object.keys(batches).length, 'screens', Object.keys(screens).length, 'svg', Object.keys(svg).length, 'missing', missing.join(','));
