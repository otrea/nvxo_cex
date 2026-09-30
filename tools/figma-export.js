// Figma -> compact JSON exporter, run inside use_figma (stored as plugin data nvxo/exp).
const R = v => Math.round(v * 10) / 10;
const hx = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const SVG = {};
const SEEN = new Set((figma.root.getSharedPluginData('nvxo', 'exp_seen') || '').split(',').filter(Boolean));
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
function col(c, op) { const h = hx(c); return op == null || op >= 0.995 ? h : [h, R(op * 100) / 100]; }
function paints(arr) {
  if (!Array.isArray(arr)) return undefined;
  const out = [];
  for (const p of arr) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') out.push(col(p.color, p.opacity));
    else if (p.type === 'GRADIENT_LINEAR') out.push({ g: p.gradientStops.map(s => [R(s.position * 100) / 100, hx(s.color), R(s.color.a * 100) / 100]), m: p.gradientTransform.map(r => r.map(v => Math.round(v * 1000) / 1000)), o: p.opacity == null ? 1 : R(p.opacity * 100) / 100 });
    else if (p.type === 'IMAGE') out.push({ img: 1 });
  }
  return out.length ? out : undefined;
}
async function svgOf(n) {
  try { const s = await n.exportAsync({ format: 'SVG_STRING', svgOutlineText: true, svgIdAttribute: false }); const k = hash(s); if (!SEEN.has(k)) { SVG[k] = s; SEEN.add(k); } return k; } catch (e) { return null; }
}
function radius(n) {
  if (typeof n.cornerRadius === 'number') return n.cornerRadius ? R(n.cornerRadius) : undefined;
  if ('topLeftRadius' in n) return [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map(R);
}
function stroke(n) {
  const s = paints(n.strokes); if (!s) return undefined;
  const o = { c: s[0] };
  const ws = 'strokeTopWeight' in n ? [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight] : null;
  if (typeof n.strokeWeight === 'number' && !(ws && ws.some(w => w !== n.strokeWeight))) o.w = R(n.strokeWeight); else if (ws) o.ws = ws.map(R);
  if (n.dashPattern && n.dashPattern.length) o.d = 1;
  if (n.strokeAlign !== 'INSIDE') o.a = n.strokeAlign[0];
  return o;
}
const NAMED = /→|^scrim|^tab bar$|^header$|^footer$|^content$|^sheet$|^status bar$|^home indicator$|^tab |^indicator$/;
function link(n, o) {
  for (const r of (n.reactions || [])) {
    const t = r.trigger && r.trigger.type; const a = (r.actions && r.actions[0]) || r.action; if (!a) continue;
    if (t === 'ON_CLICK' || t === 'ON_TAP') { if (a.type === 'BACK') o.to = 'back'; else if (a.type === 'NODE' && a.destinationId) o.to = a.destinationId; }
    if (t === 'AFTER_TIMEOUT' && a.type === 'NODE') o.auto = [a.destinationId, R(r.trigger.timeout)];
  }
  const pd = n.getSharedPluginData('nvxo', 'to'); if (pd) o.pd = pd;
}
function base(n, parentAL) {
  const o = {};
  if (parentAL && n.layoutPositioning !== 'ABSOLUTE') {
    const z = (n.layoutSizingHorizontal || 'FIXED')[0] + (n.layoutSizingVertical || 'FIXED')[0]; if (z !== 'FF') o.z = z;
    if (n.layoutGrow) o.gr = 1; if (n.layoutAlign === 'STRETCH') o.st = 1;
  } else { o.x = R(n.x); o.y = R(n.y); }
  o.w = R(n.width); o.h = R(n.height);
  if (n.opacity != null && n.opacity < 1) o.op = R(n.opacity * 100) / 100;
  if (n.rotation) o.rot = R(n.rotation);
  link(n, o);
  if (n.name && NAMED.test(n.name)) o.n = n.name;
  return o;
}
const SHAPES = { VECTOR: 1, BOOLEAN_OPERATION: 1, STAR: 1, POLYGON: 1, LINE: 1, GROUP: 1, INSTANCE: 1 };
const SCREEN_RE = /^([A-Z]\d\d[a-z]*L?|DS\d) · /;
async function node(n, parentAL, depth) {
  if (n.visible === false) return null;
  const o = base(n, parentAL);
  if (n.type === 'TEXT') {
    if (!n.characters.length) return null;
    const f0 = n.getRangeFontName(0, 1);
    if (f0.family === 'Material Icons Round') { o.t = 'I'; o.ic = n.characters; o.fs = R(n.getRangeFontSize(0, 1)); const p = paints(n.getRangeFills(0, 1)); if (p) o.f = p[0]; return o; }
    o.t = 'T';
    const segs = n.getStyledTextSegments(['fontName', 'fontSize', 'fills', 'letterSpacing', 'lineHeight', 'textDecoration']);
    o.sg = segs.map(s => {
      const p = paints(s.fills);
      const a = [s.characters, (s.fontName.family === 'SUSE Mono' ? 'M' : (s.fontName.family === 'SUSE' ? '' : s.fontName.family)) + s.fontName.style, R(s.fontSize), p ? p[0] : null];
      const lh = s.lineHeight.unit === 'PIXELS' ? R(s.lineHeight.value) : (s.lineHeight.unit === 'PERCENT' ? (Math.abs(s.lineHeight.value - 135) < 0.5 ? 0 : 'p' + R(s.lineHeight.value)) : 'a');
      const ls = s.letterSpacing.unit === 'PIXELS' ? R(s.letterSpacing.value) : R(s.letterSpacing.value * s.fontSize / 100);
      const dc = s.textDecoration === 'UNDERLINE' ? 1 : (s.textDecoration === 'STRIKETHROUGH' ? 2 : 0);
      if (lh || ls || dc) a.push(lh); if (ls || dc) a.push(ls); if (dc) a.push(dc);
      return a;
    });
    if (n.textAlignHorizontal !== 'LEFT') o.ta = n.textAlignHorizontal[0];
    if (n.textAlignVertical !== 'TOP') o.va = n.textAlignVertical[0];
    if (n.textAutoResize !== 'WIDTH_AND_HEIGHT') o.ar = n.textAutoResize[0];
    if (n.textTruncation === 'ENDING') o.tr = n.maxLines || 1;
    return o;
  }
  if (SHAPES[n.type] || (n.type === 'ELLIPSE' && n.arcData && (n.arcData.endingAngle - n.arcData.startingAngle < 6.28 || n.arcData.innerRadius > 0))) { o.t = 'S'; o.svg = await svgOf(n); return o; }
  if (n.type === 'RECTANGLE' || n.type === 'ELLIPSE') {
    o.t = n.type === 'ELLIPSE' ? 'E' : 'R'; const f = paints(n.fills); if (f) o.f = f; const r = radius(n); if (r) o.r = r; const s = stroke(n); if (s) o.s = s;
    if (f && f.some(p => p.img)) { o.t = 'S'; o.svg = await svgOf(n); delete o.f; }
    return o;
  }
  if (n.type === 'FRAME' || n.type === 'COMPONENT') {
    if (depth > 0 && SCREEN_RE.test(n.name)) { o.t = 'X'; o.ref = n.name.split(' · ')[0]; return o; }
    o.t = 'F'; const f = paints(n.fills); if (f) o.f = f; const r = radius(n); if (r) o.r = r; const s = stroke(n); if (s) o.s = s; if (n.clipsContent) o.cl = 1;
    if (f && f.some(p => p.img)) { o.t = 'S'; o.svg = await svgOf(n); delete o.f; return o; }
    const al = n.layoutMode && n.layoutMode !== 'NONE';
    if (al) {
      o.lm = n.layoutMode[0]; const p = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map(R); if (p.some(v => v)) o.p = p;
      if (n.itemSpacing) o.g = R(n.itemSpacing);
      const pa = n.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 'B' : n.primaryAxisAlignItems[0]; if (pa !== 'M') o.pa = pa;
      const ca = n.counterAxisAlignItems === 'BASELINE' ? 'L' : n.counterAxisAlignItems[0]; if (ca !== 'M') o.ca = ca;
      if (n.layoutWrap === 'WRAP') { o.wr = 1; o.cg = R(n.counterAxisSpacing || 0); }
    }
    const fx = (n.effects || []).find(e => e.type === 'DROP_SHADOW' && e.visible !== false); if (fx) o.sd = [hx(fx.color), R(fx.color.a * 100) / 100, R(fx.offset.x), R(fx.offset.y), R(fx.radius)];
    const c = [];
    for (const ch of n.children) { const x = await node(ch, al, depth + 1); if (x) c.push(x); }
    if (c.length) o.c = c;
    return o;
  }
  o.t = 'S'; o.svg = await svgOf(n); return o;
}
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
async function exp(id) { const f = await figma.getNodeByIdAsync(id); if (!f) return null; const r = await node(f, false, 0); delete r.x; delete r.y; return { id: f.id, name: f.name, tree: r }; }
async function run(ids, lightIds) {
  const screens = [];
  for (let i = 0; i < ids.length; i++) {
    const d = await exp(ids[i]); if (!d) continue; screens.push(d);
    if (lightIds && lightIds[i]) { const l = await exp(lightIds[i]); if (l) screens.push({ id: l.id, name: l.name, base: d.id, patch: diff(d.tree, l.tree) || {} }); }
  }
  figma.root.setSharedPluginData('nvxo', 'exp_seen', Array.from(SEEN).join(','));
  return { screens, svg: SVG };
}
return { run };
