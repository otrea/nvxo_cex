// v3 rollout: restyles existing CEX screens to the "v3 Final" direction (pages 06/07, section A).
// Stored as shared plugin data nvxo/v3_lib; run inside use_figma:
//   const L = await new AF('figma', G('v3_lib'))(figma); return await L.run(pageId, ['B ·','C ·'], 'dark'|'day');
// Only properties change (fills, strokes, effects, radii, fonts, visibility of hairlines, tab bar geometry),
// never the node tree, so the Light export stays a patch of the Dark one.
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const rgb = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const solid = (h, o) => ({ type: 'SOLID', color: rgb(h), opacity: o == null ? 1 : o });
const clone = v => JSON.parse(JSON.stringify(v, (k, x) => (k === 'boundVariables' ? undefined : x)));
const unbind = n => { if ('fills' in n && n.fills !== figma.mixed && JSON.stringify(n.fills).includes('VARIABLE_ALIAS')) n.fills = clone(n.fills); if ('effects' in n && JSON.stringify(n.effects).includes('VARIABLE_ALIAS')) n.effects = clone(n.effects); if ('strokes' in n && JSON.stringify(n.strokes).includes('VARIABLE_ALIAS')) n.strokes = clone(n.strokes); };
const SRC_IDS = {
  dark: { card: '2812:1457', primary: '2812:1473', tab: '2812:1536', ind: '2812:1537', well: '2812:1499', neg: '2812:1527' },
  day: { card: '2812:1686', primary: '2812:1702', tab: '2812:1765', ind: '2812:1766', well: '2812:1728', neg: '2812:1756' },
};
const OLD = {
  dark: { card: '#121318', well: '#1c1d24', track: '#2a2b33', deep: '#0d0e12', muted: '#7c7d86', red: '#ff4d5e', stroke: '#2a2b33', root: '#000000' },
  day: { card: '#f2f2f7', well: '#e8e8ee', track: '#e2e0e8', deep: '#f7f7fa', muted: '#6b6b78', red: '#e5374a', stroke: '#e2e0e8', root: '#ffffff' },
};
const NEW = {
  dark: { muted: '#8e8f99', red: '#ff5c5c', well: '#1f2027', nested: '#1f2027', track: '#2c2d35', deep: '#0f1014', root: '#000000' },
  day: { muted: '#6b6b80', red: '#d93036', well: '#e6e6ee', nested: '#f2f2f7', track: '#e6e6ee', deep: '#ffffff', root: '#f2f2f7' },
};
const ICON_FONTS = ['Material Icons Round', 'Material Symbols Sharp'];
const RENAME = { info_outline: 'info' };

async function run(pageId, sectionPrefixes, theme) {
  const page = await figma.getNodeByIdAsync(pageId);
  await figma.setCurrentPageAsync(page);
  const S = {};
  for (const k in SRC_IDS[theme]) { const n = await figma.getNodeByIdAsync(SRC_IDS[theme][k]); S[k] = { fills: clone(n.fills), effects: clone(n.effects) }; }
  const O = OLD[theme], N = NEW[theme];
  for (const f of ['SUSE', 'SUSE Mono']) for (const st of ['Regular', 'Medium', 'SemiBold', 'Bold']) { try { await figma.loadFontAsync({ family: f, style: st }); } catch (e) {} }
  for (const f of ICON_FONTS) { try { await figma.loadFontAsync({ family: f, style: 'Regular' }); } catch (e) {} }
  const stats = { frames: 0, raised: 0, wells: 0, hairlines: 0, strokes: 0, radii: 0, icons: 0, text: 0, primary: 0, tabbars: 0, red: 0, mono: 0 };

  const firstSolid = n => { if (!('fills' in n) || n.fills === figma.mixed) return null; const p = n.fills.find(x => x.visible !== false); return p && p.type === 'SOLID' ? hex(p.color) : (p ? p.type : null); };
  const isIconText = n => n.type === 'TEXT' && n.fontName !== figma.mixed && ICON_FONTS.includes(n.fontName.family);
  const isToggle = n => n.type === 'FRAME' && n.width >= 40 && n.width <= 52 && n.height >= 24 && n.height <= 32 && n.children.some(c => c.type === 'ELLIPSE');
  const iconOnly = n => n.type === 'FRAME' && n.children.length === 1 && isIconText(n.children[0]);

  function square(n) {
    if (!('cornerRadius' in n) || n.type === 'ELLIPSE' || isToggle(n)) return;
    const m = Math.min(n.width, n.height);
    const target = Math.max(m >= 8 ? 1 : 0.5, Math.round(m * 0.028 * 2) / 2);
    const cr = n.cornerRadius;
    if (cr !== figma.mixed) {
      if (!cr) return;
      const circle = Math.abs(n.width - n.height) < 1.5 && cr >= m / 2 - 1;
      // round stays for coins / avatars / radio dots; icon circles become square tiles
      if (circle && !(n.type === 'FRAME' && iconOnly(n))) return;
      n.cornerRadius = target; stats.radii++;
    } else {
      for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) if (n[k] > 0) n[k] = target;
      stats.radii++;
    }
  }
  function raise(n) { n.fills = clone(S.card.fills); n.effects = clone(S.card.effects); stats.raised++; }

  function text(n) {
    if (n.characters.length === 0) return;
    if (isIconText(n)) {
      const name = RENAME[n.characters] || n.characters;
      n.fontName = { family: 'Material Symbols Sharp', style: 'Regular' };
      if (name !== n.characters) n.characters = name;
      stats.icons++;
    }
    // colours: muted grey and red move to the v3 values (range by range, text can be multi-coloured)
    const segs = n.getStyledTextSegments(['fills']);
    for (const s of segs) {
      const p = s.fills[0]; if (!p || p.type !== 'SOLID') continue;
      const h = hex(p.color);
      let to = null;
      if (h === O.muted) to = N.muted; else if (h === O.red) { to = N.red; stats.red++; }
      if (to) { n.setRangeFills(s.start, s.end, [solid(to, p.opacity)]); stats.text++; }
    }
    // percentages in chips are data: SUSE Mono
    const par = n.parent;
    if (par && par.type === 'FRAME' && par.height <= 26 && /^[+\-−]?\d[\d,]*(\.\d+)?%$/.test(n.characters) && n.fontName !== figma.mixed && n.fontName.family === 'SUSE') {
      n.fontName = { family: 'SUSE Mono', style: 'Medium' }; stats.mono++;
    }
  }

  function tabbar(tb, root) {
    if (root.layoutMode && root.layoutMode !== 'NONE') return;
    const H = root.height;
    tb.resize(361, 64);
    tb.x = 16; tb.y = H - 64 - 18;
    if (tb.layoutMode !== 'NONE') { tb.paddingTop = 8; tb.paddingBottom = 8; tb.paddingLeft = 6; tb.paddingRight = 6; tb.itemSpacing = 0; }
    tb.cornerRadius = 2; tb.fills = clone(S.tab.fills); tb.effects = clone(S.tab.effects); tb.strokes = [];
    for (const it of tb.children) {
      if (it.type !== 'FRAME') continue;
      if (tb.layoutMode !== 'NONE') { it.layoutSizingHorizontal = 'FILL'; }
      const ind = it.findOne(x => x.name === 'indicator');
      if (ind) {
        const on = firstSolid(ind) === '#58f9b0';
        ind.resize(52, 28); ind.cornerRadius = 1;
        if (on) { ind.fills = clone(S.ind.fills); ind.effects = clone(S.ind.effects); }
        for (const ic of ind.children) if (isIconText(ic)) ic.fontSize = 20;
      }
    }
    stats.tabbars++;
  }

  function walk(n, inRaised) {
    if (n.type === 'INSTANCE' || n.visible === false) return;
    if (n.type !== 'TEXT') unbind(n);
    if (n.type === 'TEXT') { try { text(n); } catch (e) { stats.err = (stats.err || 0) + 1; } return; }
    if (n.name === 'tab bar' && n.type === 'FRAME') { tabbar(n, n.parent); for (const c of n.children) walk(c, true); return; }
    let raised = inRaised;
    const f = firstSolid(n);
    const big = n.width >= 44 && n.height >= 44;
    const p0 = ('fills' in n && n.fills !== figma.mixed) ? n.fills.find(x => x.visible !== false) : null;
    const g0 = p0 && p0.gradientStops ? hex(p0.gradientStops[0].color) : null;
    const mintish = f === '#58f9b0' || g0 === '#86fcc8' || g0 === '#7cffc4';
    const isPrimary = n.type === 'FRAME' && mintish && (/^button\/(primary|buy)/.test(n.name) || (n.height >= 44 && n.height <= 64 && n.width >= 120));
    if (isPrimary) { n.fills = clone(S.primary.fills); n.effects = clone(S.primary.effects); stats.primary++; }
    else if (f === O.card && n.type !== 'TEXT') {
      if (inRaised) { n.fills = [solid(N.nested)]; n.effects = []; } else { raise(n); raised = true; }
    } else if (f === O.well) {
      const tile = (iconOnly(n) && Math.abs(n.width - n.height) < 2 && n.width >= 32 && n.width <= 64) || (/^button\/secondary/.test(n.name) && n.height >= 44);
      if (tile && !inRaised) { raise(n); raised = true; if (iconOnly(n) && firstSolid(n.children[0]) === '#58f9b0') n.children[0].fills = [solid(theme === 'dark' ? '#ffffff' : '#000019')]; } else { n.fills = [solid(N.well)]; stats.wells++; }
    } else if (f === O.deep && n.name !== 'tab bar') { n.fills = [solid(N.deep)]; }
    else if (f === O.track) {
      const leaf = !('children' in n) || n.children.length === 0;
      if (leaf && ((n.height <= 1.5 && n.width >= 12) || (n.width <= 1.5 && n.height >= 12))) { n.visible = false; stats.hairlines++; return; }
      n.fills = [solid(N.track)];
    } else if (f === O.red) {
      const chip = n.type === 'FRAME' && n.height <= 26 && n.children.some(c => c.type === 'TEXT');
      if (chip) { n.fills = [solid(N.red, 0.12)]; for (const c of n.children) if (c.type === 'TEXT') { c.fills = [solid(N.red)]; } }
      else n.fills = [solid(N.red)];
      stats.red++;
    }
    // hairline outlines go; an outline-only box becomes a soft well
    if ('strokes' in n && n.strokes.length && !(n.dashPattern && n.dashPattern.length)) {
      const s0 = n.strokes[0];
      if (s0.type === 'SOLID' && hex(s0.color) === O.stroke) {
        n.strokes = []; stats.strokes++;
        if (n.type === 'FRAME' && !n.fills.some(p => p.visible !== false)) { n.fills = [solid(inRaised ? N.nested : N.well)]; stats.wells++; }
      } else if (s0.type === 'SOLID' && hex(s0.color) === O.red) { n.strokes = [solid(N.red, s0.opacity)]; }
    }
    square(n);
    if ('children' in n) for (const c of n.children) walk(c, raised);
  }

  const secs = page.children.filter(s => s.type === 'SECTION' && sectionPrefixes.some(p => s.name.startsWith(p)));
  for (const sec of secs) for (const fr of sec.children) {
    if (fr.type !== 'FRAME') continue;
    stats.frames++;
    const code = fr.name.split(' · ')[0];
    if (theme === 'day' && firstSolid(fr) === O.root && !/^A01/.test(code)) fr.fills = [solid(N.root)];
    for (const c of fr.children) walk(c, false);
  }
  return stats;
}
return { run };
