// v3 Day theme, derived from the restyled Dark screens (stored as nvxo/v3_day).
// The Light page mirrors the Dark tree node for node, so each Light node takes the Day value of the role its
// Dark twin has in v3 (raised card, well, track, primary, red, text tone). Light-only accents of the old theme
// (mint cards, black tiles) are dropped this way. Run: L.run(lightPageId, darkPageId, ['C ·'])
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const rgb = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const solid = (h, o) => ({ type: 'SOLID', color: rgb(h), opacity: o == null ? 1 : o });
const clone = v => JSON.parse(JSON.stringify(v, (k, x) => (k === 'boundVariables' ? undefined : x)));
const unbind = n => { if ('fills' in n && n.fills !== figma.mixed && JSON.stringify(n.fills).includes('VARIABLE_ALIAS')) n.fills = clone(n.fills); if ('effects' in n && JSON.stringify(n.effects).includes('VARIABLE_ALIAS')) n.effects = clone(n.effects); if ('strokes' in n && JSON.stringify(n.strokes).includes('VARIABLE_ALIAS')) n.strokes = clone(n.strokes); };
const SRC = { card: '2812:1686', primary: '2812:1702', tab: '2812:1765', ind: '2812:1766' };
const DSRC = { card: '2812:1457', primary: '2812:1473', tab: '2812:1536' };
const TEXT = { '#ffffff': '#000019', '#8e8f99': '#6b6b80', '#b9bac1': '#2a2a3c', '#000000': '#000000', '#ff5c5c': '#d93036', '#ffb547': '#c47a00', '#6ab2ff': '#2f7fe0', '#d4b45f': '#a8862e' };

async function run(lightPageId, darkPageId, sectionPrefixes) {
  const dp = await figma.getNodeByIdAsync(darkPageId); await dp.loadAsync();
  const lp = await figma.getNodeByIdAsync(lightPageId); await figma.setCurrentPageAsync(lp);
  const S = {}, D = {};
  for (const k in SRC) { const n = await figma.getNodeByIdAsync(SRC[k]); S[k] = { fills: clone(n.fills), effects: clone(n.effects) }; }
  for (const k in DSRC) { const n = await figma.getNodeByIdAsync(DSRC[k]); D[k] = JSON.stringify(n.fills); }
  for (const f of ['SUSE', 'SUSE Mono']) for (const st of ['Regular', 'Medium', 'SemiBold', 'Bold']) { try { await figma.loadFontAsync({ family: f, style: st }); } catch (e) {} }
  for (const f of ['Material Icons Round', 'Material Symbols Sharp']) { try { await figma.loadFontAsync({ family: f, style: 'Regular' }); } catch (e) {} }
  const stats = { frames: 0, nodes: 0, mismatch: [], err: 0 };
  const first = n => { if (!('fills' in n) || n.fills === figma.mixed) return null; return n.fills.find(x => x.visible !== false) || null; };

  function fill(d, l, inRaised) {
    const fs = JSON.stringify(d.fills);
    if (fs === D.card) { l.fills = clone(S.card.fills); l.effects = clone(S.card.effects); return true; }
    if (fs === D.primary) { l.fills = clone(S.primary.fills); l.effects = clone(S.primary.effects); return false; }
    if (d.name === 'tab bar') { l.fills = clone(S.tab.fills); l.effects = clone(S.tab.effects); return false; }
    const p = first(d);
    if (p && p.type === 'SOLID') {
      const h = hex(p.color), o = p.opacity;
      let to = null;
      if (h === '#1f2027') to = inRaised ? '#f2f2f7' : '#e6e6ee';
      else if (h === '#2c2d35') to = '#e6e6ee';
      else if (h === '#0f1014') to = '#ffffff';
      else if (h === '#ff5c5c') to = '#d93036';
      if (to) { l.fills = [solid(to, o)]; l.effects = []; }
      else if (d.name === 'indicator' && h === '#58f9b0') { l.fills = clone(S.ind.fills); l.effects = clone(S.ind.effects); }
      else if (h === '#58f9b0') { const lp0 = first(l); if (lp0 && lp0.type === 'SOLID' && ['#000000', '#000019', '#121318'].includes(hex(lp0.color))) l.fills = [solid('#58f9b0', o)]; }
    }
    if (!d.effects.length && l.effects.length && l.type !== 'TEXT') l.effects = [];
    return false;
  }
  function text(d, l) {
    if (d.fontName !== figma.mixed && l.fontName !== figma.mixed && (d.fontName.family !== l.fontName.family || d.fontName.style !== l.fontName.style)) l.fontName = clone(d.fontName);
    if (l.characters === 'info_outline') l.characters = 'info';
    if (d.fontSize !== figma.mixed && l.fontSize !== figma.mixed && d.fontSize !== l.fontSize) l.fontSize = d.fontSize;
    const segs = d.getStyledTextSegments(['fills']);
    const lsegs = l.getStyledTextSegments(['fills']);
    if (d.characters.length !== l.characters.length) return;
    for (const s of segs) {
      const p = s.fills[0]; if (!p || p.type !== 'SOLID') continue;
      const h = hex(p.color);
      let to = TEXT[h];
      if (!to) {
        // mint and other accents keep the Light colour, unless it was white text on an old dark tile
        const ls = lsegs.find(x => x.start <= s.start && x.end > s.start); const lp0 = ls && ls.fills[0];
        if (lp0 && lp0.type === 'SOLID' && hex(lp0.color) === '#ffffff' && h !== '#58f9b0') to = '#000019';
        else if (lp0 && lp0.type === 'SOLID' && hex(lp0.color) === '#ffffff') to = '#000019';
      }
      if (to) l.setRangeFills(s.start, s.end, [solid(to, p.opacity)]);
    }
  }
  function walk(d, l, inRaised) {
    if (d.type !== l.type) { stats.mismatch.push(d.name + '/' + l.name); return; }
    stats.nodes++;
    if (d.visible !== l.visible) l.visible = d.visible;
    if (d.type === 'INSTANCE' || d.visible === false) return;
    if (l.type !== 'TEXT') unbind(l);
    if (d.type === 'TEXT') { try { text(d, l); } catch (e) { stats.err++; } return; }
    let raised = inRaised;
    if ('fills' in d && d.fills !== figma.mixed) raised = fill(d, l, inRaised) || inRaised;
    if ('strokes' in d && !d.strokes.length && l.strokes && l.strokes.length) l.strokes = [];
    if ('cornerRadius' in d) {
      if (d.cornerRadius !== figma.mixed) { if (l.cornerRadius !== d.cornerRadius) l.cornerRadius = d.cornerRadius; }
      else for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) l[k] = d[k];
    }
    if (d.type === 'FRAME' && d.name === 'tab bar') {
      l.resize(d.width, d.height); l.x = d.x; l.y = d.y;
      if (d.layoutMode !== 'NONE') { l.paddingTop = d.paddingTop; l.paddingBottom = d.paddingBottom; l.paddingLeft = d.paddingLeft; l.paddingRight = d.paddingRight; l.itemSpacing = d.itemSpacing; }
    }
    if ('children' in d) {
      if (d.children.length !== l.children.length) { stats.mismatch.push(d.name + ' kids'); return; }
      if (d.type === 'FRAME' && l.layoutMode !== 'NONE' && d.parent && d.parent.name === 'tab bar') l.layoutSizingHorizontal = d.layoutSizingHorizontal;
      if (d.name === 'indicator' && (l.width !== d.width || l.height !== d.height)) l.resize(d.width, d.height);
      for (let i = 0; i < d.children.length; i++) walk(d.children[i], l.children[i], raised);
    }
  }

  const dsecs = dp.children.filter(s => s.type === 'SECTION');
  const lsecs = lp.children.filter(s => s.type === 'SECTION' && sectionPrefixes.some(p => s.name.startsWith(p)));
  for (const lsec of lsecs) {
    const dsec = dsecs.find(s => s.name.split(' · ')[0] === lsec.name.split(' · ')[0]); if (!dsec) { stats.mismatch.push('section ' + lsec.name); continue; }
    for (const lf of lsec.children) {
      if (lf.type !== 'FRAME') continue;
      const code = lf.name.split(' · ')[0].replace(/L$/, '');
      const df = dsec.children.find(f => f.type === 'FRAME' && f.name.split(' · ')[0] === code);
      if (!df) { stats.mismatch.push('frame ' + lf.name); continue; }
      stats.frames++;
      const rp = first(df);
      lf.fills = [solid(/^A01/.test(code) ? '#ffffff' : '#f2f2f7')];
      if (df.children.length !== lf.children.length) { stats.mismatch.push(lf.name + ' root kids'); continue; }
      for (let i = 0; i < df.children.length; i++) walk(df.children[i], lf.children[i], false);
    }
  }
  stats.mismatch = stats.mismatch.slice(0, 30);
  return stats;
}
return { run };
