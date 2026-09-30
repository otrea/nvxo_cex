// Subtle gradients ("a bit of life", 1 Oct 2026). Runs inside use_figma on one page and a range of sections.
// Globals expected: PAGE_ID, SECTIONS (array of section-name prefixes like 'A', 'B').
// Records, per screen, the export-space child-index path of every node it changed, in shared plugin data
// grad_<pageId>_<sectionKey>, so tools/apply-gradients.js can apply the identical paint to the export.
const pg = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(pg);
const hex = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const toHex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const stop = (pos, h, a) => { const c = hex(h); return { position: pos, color: { r: c.r, g: c.g, b: c.b, a: a } }; };
const VERT = (k) => [[0, 1 / k, 0], [-1, 0, 1]];       // top -> bottom over the top k of the height
const DIAG = [[0.5, 0.5, 0], [-0.5, 0.5, 0.5]];          // top-left -> bottom-right
const G = {
  glowDark: { type: 'GRADIENT_LINEAR', gradientTransform: VERT(0.45), gradientStops: [stop(0, '#FFFFFF', 0.06), stop(1, '#FFFFFF', 0)] },
  glowLight: { type: 'GRADIENT_LINEAR', gradientTransform: VERT(0.4), gradientStops: [stop(0, '#58F9B0', 0.12), stop(1, '#58F9B0', 0)] },
  heroDark: { type: 'GRADIENT_LINEAR', gradientTransform: DIAG, gradientStops: [stop(0, '#1E2028', 1), stop(1, '#121318', 1)] },
  heroLight: { type: 'GRADIENT_LINEAR', gradientTransform: DIAG, gradientStops: [stop(0, '#FAFAFC', 1), stop(1, '#ECECF2', 1)] },
  mintDiag: { type: 'GRADIENT_LINEAR', gradientTransform: DIAG, gradientStops: [stop(0, '#8CFCCB', 1), stop(1, '#58F9B0', 1)] },
  mintVert: { type: 'GRADIENT_LINEAR', gradientTransform: VERT(1), gradientStops: [stop(0, '#86FCC8', 1), stop(1, '#58F9B0', 1)] },
};
const SCREEN_RE = /^([A-Z]\d\d[a-z]*L?|DS\d) · /;
const solidHex = n => (n.fills && n.fills !== figma.mixed && n.fills.length === 1 && n.fills[0].type === 'SOLID' && (n.fills[0].opacity == null || n.fills[0].opacity > 0.99)) ? toHex(n.fills[0].color) : null;
const hasGrad = n => n.fills && n.fills !== figma.mixed && n.fills.some(p => p.type === 'GRADIENT_LINEAR');
function bigText(n) { return !!n.findOne(t => t.type === 'TEXT' && t.visible !== false && t.characters.length && (t.fontSize === figma.mixed ? t.getRangeFontSize(0, 1) : t.fontSize) >= 26); }
function classify(n) {
  if (n.type !== 'FRAME' && n.type !== 'ELLIPSE') return null;
  if (n.type === 'ELLIPSE' && n.arcData && (n.arcData.endingAngle - n.arcData.startingAngle < 6.28 || n.arcData.innerRadius > 0)) return null;
  if (hasGrad(n)) return null;
  const h = solidHex(n); if (!h) return null;
  const round = Math.abs(n.width - n.height) < 1 && (n.type === 'ELLIPSE' || (typeof n.cornerRadius === 'number' && n.cornerRadius >= n.width / 2 - 1));
  if (h === '#58F9B0') {
    if (round && n.width >= 72) return 'mintDiag';
    if (n.type === 'FRAME' && n.layoutMode === 'HORIZONTAL' && n.height >= 40 && n.height <= 56 && n.width >= 120 && n.children.some(c => c.type === 'TEXT')) return 'mintVert';
    if (n.type === 'FRAME' && n.width >= 330 && n.height >= 90) return 'mintDiag';
    return null;
  }
  if (n.type !== 'FRAME' || n.width < 330) return null;
  const named = /^banner/.test(n.name);
  if (/input|field|list|details|notice/.test(n.name)) return null;
  if (h === '#121318' && (named || bigText(n))) return 'heroDark';
  if (h === '#F2F2F7' && (named || bigText(n))) return 'heroLight';
  return null;
}
// export-space children: the exporter skips invisible nodes and empty texts
const kept = n => ('children' in n ? n.children.filter(c => c.visible !== false && !(c.type === 'TEXT' && !c.characters.length)) : []);
function walk(n, path, rec, record) {
  const k = classify(n);
  if (k) { n.fills = [G[k]]; if (record) rec.push([path.join('.'), k]); }
  // the exporter flattens instances, groups and boolean shapes to SVG: never touch or descend into them
  if (n.type !== 'FRAME' || (n.fills !== figma.mixed && n.fills.some(p => p.type === 'IMAGE'))) return;
  kept(n).forEach((c, i) => {
    const isScreen = c.type === 'FRAME' && SCREEN_RE.test(c.name);
    walk(c, path.concat(i), rec, record && !isScreen);
  });
}
const out = {}; let count = 0;
for (const sec of pg.children.filter(s => s.type === 'SECTION' && SECTIONS.includes(s.name.split(' · ')[0]))) {
  const recs = {};
  for (const f of sec.children.filter(f => f.type === 'FRAME' && SCREEN_RE.test(f.name))) {
    const rec = [];
    const base = solidHex(f);
    if (!hasGrad(f) && (base === '#000000' || base === '#FFFFFF')) { f.fills = [f.fills[0], base === '#000000' ? G.glowDark : G.glowLight]; rec.push(['', base === '#000000' ? 'glowDark' : 'glowLight']); }
    kept(f).forEach((c, i) => walk(c, [i], rec, !(c.type === 'FRAME' && SCREEN_RE.test(c.name))));
    recs[f.id] = rec; count += rec.length;
  }
  const key = 'grad_' + PAGE_ID.replace(':', '_') + '_' + sec.name.split(' · ')[0];
  figma.root.setSharedPluginData('nvxo', key, JSON.stringify(recs));
  out[sec.name.split(' · ')[0]] = Object.keys(recs).length;
}
return { screens: out, changed: count };
