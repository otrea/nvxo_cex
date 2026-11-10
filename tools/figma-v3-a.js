// Section A from "v3 Final": clones the v3 frames (pages 06/07) into section A of the app pages (01/04),
// gives them the app's structure (status bar / header / content / footer / tab bar), wires the links the old
// frames had, builds the Gainers / New variants of the guest home, and removes the old frames.
// Run (one page per call): const L = await new AF('figma', G('v3_a'))(figma); return await L.run('dark'|'day');
const V3 = {
  dark: { page: '0:1', suf: '', coinComp: '2685:966', A01: '2812:1364', A02: '2812:1399', A03: '2813:1419', A04: '2813:1469', A05: '2812:1449', A06: '2813:1514' },
  day: { page: '2669:1310', suf: 'L', coinComp: '2685:972', A01: '2812:1592', A02: '2812:1628', A03: '2813:1610', A04: '2813:1660', A05: '2812:1678', A06: '2813:1705' },
};
const COMP = { BTC: '0:11835', ETH: '0:11386', ADA: '0:12117', DOGE: '0:11552' };
const COIN = {
  NVXO: ['NVXO Coin', '6.2540', '+11.13%'], DOGE: ['Dogecoin', '0.1523', '+5.21%'], ADA: ['Cardano', '0.4412', '+3.05%'], BTC: ['Bitcoin', '67,412.50', '+2.31%'],
  TON: ['Toncoin', '5.6210', '+4.02%'], ARB: ['Arbitrum', '0.8120', '−1.10%'], PEPE: ['Pepe', '0.00001102', '+7.84%'], AVAX: ['Avalanche', '28.40', '+0.92%'],
};
const STATUS = ['9:41', 'icon/signal_cellular_alt', 'icon/wifi', 'icon/battery_full'];
const link = (n, to, label) => { n.setSharedPluginData('nvxo', 'to', to); n.name = (label || n.name.replace(/ → .*$/, '')) + ' → ' + to; };

async function run(theme) {
  const T = V3[theme];
  const page = await figma.getNodeByIdAsync(T.page); await figma.setCurrentPageAsync(page);
  for (const f of ['SUSE', 'SUSE Mono']) for (const st of ['Regular', 'Medium', 'SemiBold', 'Bold']) { try { await figma.loadFontAsync({ family: f, style: st }); } catch (e) {} }
  await figma.loadFontAsync({ family: 'Material Symbols Sharp', style: 'Regular' });
  const sec = page.children.find(s => s.type === 'SECTION' && s.name.startsWith('A ·'));
  const old = c => sec.children.find(f => f.type === 'FRAME' && f.name.split(' · ')[0] === c + T.suf);
  const out = { made: {}, removed: [], errs: [] };

  function group(f, nodes, name, x, y, w, h) {
    const g = figma.createFrame(); f.appendChild(g);
    g.name = name; g.fills = []; g.clipsContent = false; g.x = x; g.y = y; g.resize(w, h);
    for (const n of nodes) { const nx = n.x - x, ny = n.y - y; g.appendChild(n); n.x = nx; n.y = ny; }
    return g;
  }
  async function base(code) {
    const o = old(code); const src = await figma.getNodeByIdAsync(T[code]);
    const f = src.clone(); sec.appendChild(f); f.x = o.x; f.y = o.y; f.name = o.name;
    for (const c of [...f.children]) if (STATUS.includes(c.name) && c.type === 'TEXT') c.remove();
    const sb = o.findChild(c => c.name === 'status bar').clone(); f.appendChild(sb); sb.x = 0; sb.y = 0;
    return { f, o };
  }
  const kids = (f, pred) => f.children.filter(c => c.name !== 'status bar' && c.name !== 'home indicator' && pred(c));
  const top = f => { const sb = f.findChild(c => c.name === 'status bar'), hi = f.findChild(c => c.name === 'home indicator'); if (sb) f.appendChild(sb); if (hi) f.appendChild(hi); };
  const textNamed = (f, s) => f.findOne(n => n.type === 'TEXT' && n.characters === s);
  const made = {};

  // A01 splash
  { const { f } = await base('A01'); group(f, kids(f, () => true), 'content', 0, 50, 393, 781); top(f); made.A01 = f; }
  // A02–A04 onboarding
  const next = { A02: 'A03', A03: 'A04' };
  for (const code of ['A02', 'A03', 'A04']) {
    const { f } = await base(code);
    const sk = textNamed(f, 'Skip'); link(sk, 'A05', 'Skip');
    const h = group(f, kids(f, c => c.y < 100), 'header', 0, 50, 393, 50);
    group(f, kids(f, c => c !== h && c.y >= 100 && c.y < 700), 'content', 0, 100, 393, 600);
    const foot = group(f, kids(f, c => c.name !== 'header' && c.name !== 'content' && c.y >= 700), 'footer', 0, 700, 393, 130);
    for (const b of foot.children) {
      if (/^button\/primary Next/.test(b.name)) link(b, next[code]);
      if (/^button\/primary Get started/.test(b.name)) link(b, 'B05');
      if (b.type === 'TEXT' && /already have an account/.test(b.characters)) link(b, 'B01', 'link I already have an account');
    }
    top(f); made[code] = f;
  }
  // A05 guest home
  function home(f, o) {
    const tb = f.findChild(c => c.name === 'tab bar · floating'); if (tb) tb.remove();
    const t = o.findChild(c => c.name === 'tab bar').clone(); f.appendChild(t); t.x = 16; t.y = f.height - 64 - 18;
    const tg = f.findChild(c => c.name === 'theme toggle'); link(tg, 'C07');
    const hd = group(f, kids(f, c => c.y >= 50 && c.y < 110 && c.name !== 'tab bar'), 'header', 0, 50, 393, 56);
    for (const b of f.children) {
      if (/^button\/secondary Sign up/.test(b.name)) link(b, 'B05');
      if (/^button\/primary Log in/.test(b.name)) link(b, 'B01');
      const m = /^action (\w+)/.exec(b.name);
      if (m) link(b, m[1] === 'Support' ? 'R01' : m[1] === 'More' ? 'C04' : 'Z07', 'action ' + m[1]);
    }
    const am = textNamed(f, 'All markets'); link(am, 'D01', 'link All markets');
    const hero = f.findChild(c => /^hero/.test(c.name)); link(hero, 'D04', 'tile NVXO');
    // market list rows -> tappable tiles
    const ml = f.findChild(c => c.name === 'market list');
    const rows = [0, 1, 2, 3].map(i => ml.children.filter(c => c.y >= i * 60 && c.y < i * 60 + 60));
    rows.forEach((r, i) => {
      const sym = r.find(c => c.type === 'TEXT' && /^[A-Z]{2,5}$/.test(c.characters)).characters;
      group(ml, r, 'tile ' + sym + ' → D04', 0, i * 60, 353, 60).setSharedPluginData('nvxo', 'to', 'D04');
    });
    group(f, kids(f, c => c !== hd && c.name !== 'tab bar' && c.name !== 'header'), 'content', 0, 106, 393, f.height - 106 - 82);
    top(f);
    return f;
  }
  { const { f, o } = await base('A05'); made.A05 = home(f, o); const seg = made.A05.findOne(n => n.name === 'segmented · markets');
    link(seg.findChild(c => c.type === 'TEXT' && c.characters === 'Gainers'), 'A05g', 'tab Gainers');
    link(seg.findChild(c => c.type === 'TEXT' && c.characters === 'New'), 'A05n', 'tab New'); }
  // A06 wallets guest
  { const { f, o } = await base('A06');
    const tb = f.findChild(c => c.name === 'tab bar · floating'); if (tb) tb.remove();
    const t = o.findChild(c => c.name === 'tab bar').clone(); f.appendChild(t); t.x = 16; t.y = f.height - 64 - 18;
    group(f, kids(f, c => c.y >= 50 && c.y < 110 && c.name !== 'tab bar'), 'header', 0, 50, 393, 56);
    const es = f.findChild(c => /^empty state/.test(c.name));
    for (const b of es.children) { if (/^button\/secondary Register/.test(b.name)) link(b, 'B05'); if (/^button\/primary Log in/.test(b.name)) link(b, 'B01'); }
    group(f, kids(f, c => c.name !== 'tab bar' && c.name !== 'header'), 'content', 0, 106, 393, f.height - 106 - 82);
    top(f); made.A06 = f; }

  // A05g / A05n: same home, other segment active and other coins
  const homeOld = { A05g: old('A05g'), A05n: old('A05n') };
  const lists = { A05g: ['NVXO', 'DOGE', 'ADA', 'BTC'], A05n: ['TON', 'ARB', 'PEPE', 'AVAX'] };
  const segIdx = { A05g: 1, A05n: 2 };
  const nvxoComp = await figma.getNodeByIdAsync(T.coinComp);
  const comps = {}; for (const k in COMP) comps[k] = await figma.getNodeByIdAsync(COMP[k]);
  for (const code of ['A05g', 'A05n']) {
    const f = made.A05.clone(); sec.appendChild(f); const o = homeOld[code]; f.x = o.x; f.y = o.y; f.name = o.name;
    const seg = f.findOne(n => n.name === 'segmented · markets');
    const labels = seg.children.filter(c => c.type === 'TEXT');
    const act = seg.findChild(c => c.name === 'active segment');
    const on = labels[0].fills, off = labels[1].fills;
    act.x = labels[segIdx[code]].x;
    labels.forEach((l, i) => {
      l.fills = JSON.parse(JSON.stringify(i === segIdx[code] ? on : off));
      const to = ['A05', 'A05g', 'A05n'][i];
      if (to === code) { l.setSharedPluginData('nvxo', 'to', ''); l.name = 'tab ' + l.characters; } else link(l, to, 'tab ' + l.characters);
    });
    const ml = f.findOne(n => n.name === 'market list');
    const tiles = ml.children.slice();
    const posT = tiles[1], negT = tiles[2]; // ETH (positive), SOL (negative, letter avatar)
    lists[code].forEach((sym, i) => {
      const [name, price, ch] = COIN[sym];
      const neg = ch[0] === '−';
      const t = (neg ? negT : posT).clone(); ml.appendChild(t); t.x = 0; t.y = i * 60; link(t, 'D04', 'tile ' + sym);
      const txt = t.findAll(n => n.type === 'TEXT');
      const symT = txt.find(n => /^[A-Z]{2,5}$/.test(n.characters) && n.fontSize >= 15);
      const nameT = txt.find(n => n.y > symT.y && n.x === symT.x);
      const priceT = txt.find(n => /^[\d,.]+$/.test(n.characters) && n.width >= 100);
      const chipT = t.findOne(n => /^chip/.test(n.name)).findChild(n => n.type === 'TEXT');
      symT.characters = sym; nameT.characters = name; priceT.characters = price; chipT.characters = ch;
      t.findOne(n => /^chip/.test(n.name)).name = 'chip ' + ch;
      // avatar: library icon where there is one, else the letter disc
      const inst = t.children.find(n => n.type === 'INSTANCE');
      const disc = t.children.find(n => n.type === 'ELLIPSE'); const letter = disc && t.children.find(n => n.type === 'TEXT' && n.characters.length === 1);
      const comp = sym === 'NVXO' ? nvxoComp : (comps[sym] || null);
      if (comp) {
        const x = inst || disc; const ni = comp.createInstance(); t.appendChild(ni); ni.resize(32, 32); ni.x = x.x; ni.y = x.y; ni.name = sym.toLowerCase();
        if (inst) inst.remove(); if (disc) { disc.remove(); if (letter) letter.remove(); }
      } else if (letter) { letter.characters = sym[0]; disc.name = 'coin/' + sym; }
      else if (inst) {
        const d = negT.children.find(n => n.type === 'ELLIPSE').clone(); const l = negT.children.find(n => n.type === 'TEXT' && n.characters.length === 1).clone();
        t.appendChild(d); t.appendChild(l); d.x = inst.x; d.y = inst.y; l.x = inst.x; l.y = inst.y + 7; l.characters = sym[0]; d.name = 'coin/' + sym; inst.remove();
      }
    });
    tiles.forEach(x => x.remove());
    made[code] = f;
  }
  const tr = (old('A01').reactions || []).find(r => r.trigger && r.trigger.type === 'AFTER_TIMEOUT');
  const oldTimer = tr ? tr.trigger.timeout : 2.4;
  // links from the old frames into section A now point at the new ones; drop the old frames
  for (const c of ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A05g', 'A05n']) { const o = old(c); out.removed.push(o.id); o.remove(); }
  // splash timer
  await made.A01.setReactionsAsync([{ trigger: { type: 'AFTER_TIMEOUT', timeout: oldTimer }, actions: [{ type: 'NODE', destinationId: made.A02.id, navigation: 'NAVIGATE', transition: null, preserveScrollPosition: false }] }]);
  for (const k in made) out.made[k + T.suf] = made[k].id;
  return out;
}
return { run };
