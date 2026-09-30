// Regenerates the candle chart of a D04 variant for another timeframe (run inside use_figma).
// Keeps candle x positions, colours and the last price (67,412.50); rewrites the price axis,
// candle bodies/wicks, volume bars and moves the last-price line + tag to the new scale.
// Usage: chartFor(frame, { top, step, seed })  — axis labels are top, top-step, … top-4*step.
function chartFor(frame, { top, step, seed }) {
  const LAST = 67412.5;
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ch = frame.findOne(n => n.name === 'chart candle');
  const hex = r => { const c = r.fills && r.fills[0] && r.fills[0].color; return c ? [c.r, c.g, c.b].map(v => Math.round(v * 255)).join(',') : ''; };
  const rects = ch.children.filter(k => k.type === 'RECTANGLE');
  const grey = hex(rects.find(r => r.width > 100));
  const vols = rects.filter(r => r.width > 1.5 && r.width < 10 && hex(r) === grey).sort((a, b) => a.x - b.x);
  const bodies = rects.filter(r => r.width > 1.5 && r.width < 10 && hex(r) !== grey).sort((a, b) => a.x - b.x);
  const wicks = rects.filter(r => r.width <= 1.5 && r.height > 1.5).sort((a, b) => a.x - b.x);
  const line = rects.find(r => r.width > 100 && hex(r) !== grey);
  const tag = ch.children.find(k => k.type === 'FRAME' && k.fills && k.fills[0] && hex(k) !== grey && k.fills[0].type === 'SOLID' && hex(k) === hex(line));
  const labels = ch.children.filter(k => k.type === 'TEXT').sort((a, b) => a.y - b.y);
  const up = bodies.find(b => hex(b) === hex(line)).fills, down = bodies.find(b => hex(b) !== hex(line)).fills;
  // axis
  const y0 = labels[0].y + labels[0].height / 2, y4 = labels[labels.length - 1].y + labels[labels.length - 1].height / 2;
  const bottom = top - step * (labels.length - 1);
  // the plugin sandbox ignores locales, so group thousands by hand
  labels.forEach((t, i) => { t.characters = String(top - step * i).replace(/\B(?=(\d{3})+(?!\d))/g, ','); t.name = t.characters; });
  const Y = v => y0 + (top - v) / (top - bottom) * (y4 - y0);
  // price walk that ends on the last price and stays inside the axis
  const n = bodies.length, c = [0];
  for (let i = 1; i < n; i++) c.push(c[i - 1] + (rnd() - 0.47) * 2);
  const off = c[n - 1], mn = Math.min(...c), mx = Math.max(...c);
  const hi = top - step * 0.3, lo = bottom + step * 0.3;
  const k = Math.min(mx - off > 0 ? (hi - LAST) / (mx - off) : 1e9, off - mn > 0 ? (LAST - lo) / (off - mn) : 1e9);
  const close = c.map(v => LAST + (v - off) * k);
  bodies.forEach((b, i) => {
    const o = i ? close[i - 1] : close[0] - (rnd() - 0.5) * k, cl = close[i];
    const h = Math.max(o, cl) + rnd() * k * 0.8, l = Math.min(o, cl) - rnd() * k * 0.8;
    const yt = Y(Math.max(o, cl)), yb = Y(Math.min(o, cl));
    b.y = yt; b.resize(b.width, Math.max(1.5, yb - yt)); b.fills = cl >= o ? up : down;
    const w = wicks.reduce((best, x) => (Math.abs(x.x + x.width / 2 - (b.x + b.width / 2)) < Math.abs(best.x + best.width / 2 - (b.x + b.width / 2)) ? x : best), wicks[0]);
    w.y = Y(h); w.resize(w.width, Math.max(1.5, Y(l) - Y(h))); w.fills = b.fills;
  });
  vols.forEach(v => { const base = v.y + v.height, h = 4 + rnd() * 26; v.resize(v.width, h); v.y = base - h; });
  const ly = Y(LAST);
  if (line) line.y = ly;
  if (tag) tag.y = ly - tag.height / 2;
}
