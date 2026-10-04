// Turns a static design frame into the screen the user should see right now:
// - the coin they opened (the trade / chart screens are drawn for BTC)
// - favourite stars and the Favourites list
// - P2P filters (currency, amount, payment method) and their sheets
// - the phone country picked on sign-up
// - a picked support attachment
// - editable fields (typing, steppers, ½ / ×2) and search fields that filter the list below them
// Taps that need app logic are tagged with `ax` and handled in Screen.
import { CODE, DNode, Field, Seg, treeFor } from '@/design/data';
import { BASE, COINS, COUNTRIES, decimalsOf, FIAT, fmt, parseNum, pct } from './coins';
import { restyle } from './interact';
import { color } from './paint';
import type { AppState } from './store';

export type Ctx = { code: string; light: boolean; app: AppState; fv: Record<string, string> };

// ---------- tree helpers ----------
const clone = (n: DNode): DNode => ({ ...n, c: n.c?.map(clone) });
export const txt = (n: DNode) => (n.sg ?? []).map(s => s[0]).join('');
export function allText(n: DNode): string[] {
  const o: string[] = [];
  (function w(x: DNode) { if (x.t === 'T') o.push(txt(x)); x.c?.forEach(w); })(n);
  return o;
}
function walk(n: DNode, fn: (n: DNode, parent: DNode | null) => void, parent: DNode | null = null) {
  fn(n, parent);
  n.c?.forEach(c => walk(c, fn, n));
}
const find = (n: DNode, pred: (x: DNode) => boolean): DNode | undefined => {
  if (pred(n)) return n;
  for (const c of n.c ?? []) { const r = find(c, pred); if (r) return r; }
  return undefined;
};
const findAll = (n: DNode, pred: (x: DNode) => boolean) => { const o: DNode[] = []; walk(n, x => { if (pred(x)) o.push(x); }); return o; };
const parentOf = (root: DNode, pred: (x: DNode) => boolean) => find(root, p => !!p.c?.some(pred));
const setText = (n: DNode, s: string) => { if (n.sg?.length && txt(n) !== s) n.sg = [[s, ...n.sg[0].slice(1)] as Seg]; };
const mapSegs = (n: DNode, fn: (s: string) => string) => {
  if (!n.sg) return false;
  let changed = false;
  const sg = n.sg.map(g => { const s = fn(g[0]); if (s === g[0]) return g; changed = true; return [s, ...g.slice(1)] as Seg; });
  if (changed) n.sg = sg;
  return changed;
};
const name = (n: DNode) => n.n ?? '';
const isDivider = (n: DNode) => (n.t === 'R' || n.t === 'F') && n.h <= 1 && !n.c?.length;

function rgb(c?: string) {
  if (!c) return null;
  const m = /^#([0-9a-f]{6})/i.exec(c);
  if (m) { const v = parseInt(m[1], 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
  const r = /rgba?\((\d+),(\d+),(\d+)/.exec(c.replace(/\s/g, ''));
  return r ? [+r[1], +r[2], +r[3]] : null;
}
/** grey text = placeholder */
function isMuted(c?: string) {
  const v = rgb(c);
  if (!v) return false;
  const l = (0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]) / 255;
  return l > 0.25 && l < 0.78 && Math.max(...v) - Math.min(...v) < 40;
}

// ---------- colours taken from the design itself ----------
type Pal = { starOn: string; starOff: string; text: string; muted: string; red: { f: DNode['f']; tc: string } | null; redText: string };
const palCache: Record<string, Pal> = {};
function palette(light: boolean): Pal {
  const k = light ? 'l' : 'd';
  if (palCache[k]) return palCache[k];
  const d01 = treeFor(CODE.D01, light);
  const p: Pal = { starOn: '#D4B45F', starOff: light ? '#6B6B78' : '#7C7D86', text: light ? '#000019' : '#FFFFFF', muted: light ? '#6B6B78' : '#7C7D86', red: null, redText: '#FF5A6E' };
  if (d01) {
    const on = find(d01, n => n.t === 'I' && n.ic === 'star'); if (on) p.starOn = color(on.f as any) ?? p.starOn;
    const off = find(d01, n => n.t === 'I' && n.ic === 'star_outline'); if (off) { p.starOff = color(off.f as any) ?? p.starOff; p.muted = p.starOff; }
    const btc = find(d01, n => /^pair BTC/.test(name(n)));
    const t = btc && find(btc, n => n.t === 'T' && txt(n) === 'BTC/USDT');
    if (t?.sg) p.text = color(t.sg[0][3]) ?? p.text;
    const sol = find(d01, n => /^pair SOL/.test(name(n)));
    const badge = sol && find(sol, n => n.t === 'F' && !!n.c?.some(c => c.t === 'T' && /^-\d/.test(txt(c))));
    const bt = badge?.c?.find(c => c.t === 'T');
    if (badge && bt?.sg) {
      p.red = { f: badge.f, tc: color(bt.sg[0][3]) ?? '#FFFFFF' };
      p.redText = color((Array.isArray(badge.f) ? badge.f[0] : badge.f) as any) ?? p.redText;
    }
  }
  return (palCache[k] = p);
}

const seg = (s: string, style: string, fs: number, c: string): Seg => [s, style, fs, c];
function emptyNode(icon: string, title: string, sub: string, pal: Pal, w = 353): DNode {
  const t = (s: string, st: string, fs: number, c: string): DNode => ({ t: 'T', w, h: fs * 1.4, z: 'FH', st: 1, ar: 'H', ta: 'C', sg: [seg(s, st, fs, c)] });
  return {
    t: 'F', n: 'empty', lm: 'V', w, h: 140, z: 'FH', st: 1, p: [36, 16, 36, 16], g: 8, ca: 'C',
    c: [{ t: 'I', ic: icon, fs: 32, w: 32, h: 32, f: pal.muted }, t(title, 'SemiBold', 15, pal.text), t(sub, 'Regular', 13, pal.muted)],
  };
}

// ---------- coin context ----------
const NUM = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+/g;
export const COIN_SCREENS = /^(D04|D05|E0[1-58])/;
function coinize(root: DNode, sym: string, pal: Pal) {
  const c = COINS[sym];
  if (!c || sym === 'BTC') return;
  const r = c.price / BASE.price;
  // the user's own open orders keep their own pair
  const own = new Set<DNode>();
  walk(root, n => { if (/^row (Buy|Sell) /.test(name(n))) walk(n, x => { own.add(x); }); });
  walk(root, (n, parent) => {
    if (n.t !== 'T' || own.has(n)) return;
    let neg = false;
    mapSegs(n, s0 => {
      let s = s0;
      if (s.length <= 40) s = s.replace(/\bBTC\b/g, sym).replace(/\bBitcoin\b/g, c.name);
      s = s.replace(NUM, tok => {
        const v = parseNum(tok);
        if (v < 55000 || v > 75000) return tok;
        if (v === BASE.price) return fmt(c.price, c.dec);
        const nv = v * r;
        // enough significant digits that neighbouring prices (order book, axis) stay distinct
        const sig = Math.max(0, (decimalsOf(tok) ? 6 : 4) - (Math.floor(Math.log10(nv)) + 1));
        return fmt(nv, Math.max(sig, c.dec + decimalsOf(tok) - 2));
      });
      if (s === '1.24B') s = c.vol;
      if (s === 'Vol 1.24B') s = 'Vol ' + c.vol;
      if (s === '+2.31%') { s = pct(c.ch); neg = c.ch < 0; }
      return s;
    });
    if (neg) {
      if (parent && parent.f && pal.red) { parent.f = pal.red.f; n.sg = n.sg!.map(g => [g[0], g[1], g[2], pal.red!.tc, ...g.slice(4)] as Seg); }
      else n.sg = n.sg!.map(g => [g[0], g[1], g[2], pal.redText, ...g.slice(4)] as Seg);
    }
  });
}

// ---------- favourites ----------
const STAR = /^star(_border|_outline)?$/;
const rowSym = (n: DNode) => { const m = /^(pair|tile|row) ([A-Z0-9]{2,6})\b/.exec(name(n)); return m && COINS[m[2]] ? m[2] : undefined; };
function stars(root: DNode, app: AppState, pal: Pal, headerSym?: string) {
  (function w(n: DNode, sym?: string) {
    sym = rowSym(n) ?? sym;
    if (n.t === 'I' && STAR.test(n.ic ?? '') && /^icon\/star/.test(name(n))) {
      const s = sym ?? headerSym;
      if (s) {
        const on = app.fav.includes(s);
        n.ax = 'fav ' + s;
        n.pd = n.pd ?? 'self';
        n.f = on ? pal.starOn : sym ? pal.starOff : n.f;
        n.ic = on ? 'star' : 'star_outline';
      }
    }
    n.c?.forEach(c => w(c, sym));
  })(root);
}
function favouritesList(root: DNode, app: AppState, light: boolean, pal: Pal) {
  const isPair = (n: DNode) => /^pair /.test(name(n));
  const P = parentOf(root, isPair);
  if (!P?.c) return;
  const first = P.c.findIndex(isPair);
  const pool = new Map<string, DNode>();
  const d01 = treeFor(CODE.D01, light);
  if (d01) findAll(d01, isPair).forEach(r => { const s = rowSym(r); if (s) pool.set(s, r); });
  P.c.filter(isPair).forEach(r => { const s = rowSym(r); if (s) pool.set(s, r); });
  const btc = pool.get('BTC');
  const rows = app.fav.map(s => {
    const src = pool.get(s);
    if (src) return clone(src);
    if (!btc) return null;
    // a coin without a market row in the design (e.g. TON from the Home tiles)
    const r = clone(btc);
    r.n = `pair ${s} → D04`;
    coinize(r, s, pal);
    const li = r.c?.findIndex(c => c.t === 'S') ?? -1;
    if (li >= 0) r.c![li] = { t: 'F', w: 32, h: 32, r: 16, f: [light ? '#EDEDF2' : '#1C1D24'], lm: 'H', pa: 'C', ca: 'C', c: [{ t: 'T', w: 12, h: 18, z: 'HH', sg: [seg(s[0], 'Bold', 14, pal.text)] }] };
    return r;
  }).filter(Boolean) as DNode[];
  const rest = P.c.slice(first).filter(c => !isPair(c));
  P.c = [...P.c.slice(0, first), ...(rows.length ? rows : [emptyNode('star_outline', 'No favourites yet', 'Tap the star next to a pair to add it here.', pal)]), ...rest];
}

// ---------- sheets with a radio list ----------
function radioColors(root: DNode) {
  const on = find(root, n => n.t === 'I' && n.ic === 'check_circle');
  const off = find(root, n => n.t === 'I' && n.ic === 'radio_button_unchecked');
  return { on: (on && color(on.f as any)) || '#58F9B0', off: (off && color(off.f as any)) || '#7C7D86' };
}
function setRadio(row: DNode, on: boolean, rc: { on: string; off: string }) {
  walk(row, n => {
    if (n.t === 'I' && /^(check_circle|radio_button_unchecked|radio_button_checked)$/.test(n.ic ?? '')) {
      n.ic = on ? 'check_circle' : 'radio_button_unchecked';
      n.f = on ? rc.on : rc.off;
    }
  });
}

// ---------- P2P ----------
function convertEUR(s: string, cur: string) {
  if (cur === 'EUR' || !/\bEUR\b/.test(s)) return s;
  const rate = FIAT[cur] ?? 1;
  return s
    .replace(/\d[\d,]*(?:\.\d+)?/g, tok => {
      const v = parseNum(tok) * rate;
      return fmt(v, decimalsOf(tok) ? (v < 10 ? 3 : v < 1000 ? 2 : 0) : 0);
    })
    .replace(/\bEUR\b/g, cur);
}
function p2pList(root: DNode, app: AppState, pal: Pal) {
  const { cur, amount, method } = app.p2p;
  walk(root, n => {
    const t = n.c?.find(c => c.t === 'T');
    if (!t) return;
    if (/^row → G11\b/.test(name(n))) setText(t, cur);
    if (/^row → G14\b/.test(name(n))) setText(t, amount != null ? `${fmt(amount, 0)} ${cur}` : 'Amount');
    if (/^row → G08\b/.test(name(n))) setText(t, method ?? 'All payment methods');
  });
  const content = root.c?.find(c => c.n === 'content');
  if (!content?.c) return;
  const cards = content.c.filter(c => allText(c).some(s => /^Limit /.test(s)));
  if (!cards.length) return;
  const at = content.c.indexOf(cards[0]);
  const tag = method === 'SEPA bank transfer' ? 'SEPA' : method;
  const keep = cards.filter(card => {
    const texts = allText(card);
    if (tag && !texts.includes(tag)) return false;
    if (amount != null) {
      const m = texts.map(s => /^Limit ([\d,.]+) – ([\d,.]+) EUR/.exec(s)).find(Boolean);
      const eur = amount / (FIAT[cur] ?? 1);
      if (m && (eur < parseNum(m[1]) || eur > parseNum(m[2]))) return false;
    }
    return true;
  });
  keep.forEach(card => walk(card, n => { if (n.t === 'T') mapSegs(n, s => convertEUR(s, cur)); }));
  content.c = content.c.filter(c => !cards.includes(c) || keep.includes(c));
  if (!keep.length) content.c.splice(at, 0, emptyNode('search_off', 'No ads match your filters', 'Try another payment method or amount.', pal));
}
function p2pSheets(root: DNode, code: string, app: AppState, fv: Record<string, string>) {
  const rc = radioColors(root);
  if (code === 'G08') walk(root, n => {
    const m = /^row (.+) → self$/.exec(name(n));
    if (m) { n.ax = 'method ' + m[1]; setRadio(n, (app.pend.method ?? 'All payment methods') === m[1], rc); }
  });
  if (code === 'G11') walk(root, n => {
    const m = /^row ([A-Z]{3}) → back$/.exec(name(n));
    if (m) { n.ax = 'cur ' + m[1]; setRadio(n, app.p2p.cur === m[1], rc); }
  });
  if (code === 'G14') {
    const chips = findAll(root, n => /^row → self/.test(name(n)) && /^[\d,]+$/.test(allText(n)[0] ?? ''));
    const mint = (n: DNode) => /58F9B0/i.test(JSON.stringify(n.f ?? ''));
    const onTpl = chips.find(mint), offTpl = chips.find(c => !mint(c));
    const val = app.pend.amount;
    chips.forEach(ch => {
      const v = parseNum(allText(ch)[0]);
      ch.ax = 'amt ' + v;
      const tpl = val === v ? onTpl : offTpl;
      if (tpl && tpl !== ch) Object.assign(ch, restyle(ch, tpl));
    });
    void fv;
  }
  walk(root, n => {
    if (/^button\/primary Apply/.test(name(n))) n.ax = 'p2p-apply';
    if (/^button\/ghost Clear/.test(name(n))) n.ax = 'p2p-clear';
  });
}

// ---------- fields & search ----------
function fields(root: DNode, ctx: Ctx, pal: Pal) {
  const out: Field[] = [];
  let i = 0;
  walk(root, n => {
    if (!(n.t === 'F' && !n.to && !n.pd && n.lm === 'H' && n.s && n.h >= 36 && n.h <= 60 && n.w >= 100 && !/^button\//.test(name(n)))) return;
    const t = n.c?.find(c => c.t === 'T');
    if (!t?.sg) return;
    const v = txt(t);
    const search = !!n.c!.some(c => c.t === 'I' && c.ic === 'search');
    const numeric = /\d/.test(v) && /^[\d,.\s]+$/.test(v);
    const secure = /^•+$/.test(v);
    const tc = color(t.sg[0][3]);
    const muted = isMuted(tc);
    if (v.includes('…') || v.length > 40 || v === 'Market price') return;
    if (!numeric && !secure && !muted && !/^[\p{L}@.\-\s']+$/u.test(v)) return;
    const k = 'f' + i++;
    const suffix = n.c!.filter(c => c.t === 'T').length > 1;
    const f: Field = {
      k,
      v: muted ? '' : secure ? '' : v,
      ph: muted ? v : secure ? v : '',
      kind: search ? 'search' : secure ? 'secure' : numeric || suffix || /code/i.test(v) ? 'num' : 'text',
      vc: muted ? pal.text : tc ?? pal.text,
      dec: decimalsOf(v),
    };
    if (search) f.r = 1;
    if (ctx.fv[k] !== undefined) f.v = ctx.fv[k];
    t.in = f;
    out.push(f);
    // − / + icons inside the field step its value
    const minus = n.c!.find(c => c.t === 'I' && c.ic === 'remove'), plus = n.c!.find(c => c.t === 'I' && c.ic === 'add');
    if (minus && plus) { f.stp = 1; minus.ax = `step ${k} -1`; plus.ax = `step ${k} 1`; minus.pd = plus.pd = 'self'; }
  });
  return out;
}

/** Live total = price × amount on the order forms. */
function totals(root: DNode, fs: Field[]) {
  const amount = fs.find(f => f.ph === 'Amount'), total = fs.find(f => f.ph === 'Total');
  const price = fs.find(f => f.kind === 'num' && f.v && f !== amount && f !== total);
  if (!amount || !total || !price) return;
  amount.r = price.r = total.r = 1;
  const a = parseNum(amount.v), p = parseNum(price.v);
  if (!total.v && a > 0 && p > 0) total.v = fmt(a * p, 2);
  void root;
}

function searchFilter(root: DNode, fs: Field[], pal: Pal) {
  for (const f of fs) {
    if (f.kind !== 'search') continue;
    const q = f.v.trim().toLowerCase();
    if (!q) continue;
    // rows that come after the search field in reading order
    let seen = false;
    const rows: DNode[] = [];
    walk(root, n => {
      if (n.t === 'T' && n.in === f) seen = true;
      else if (seen && /^(row|pair|tile) [^→]*[^\s→][^→]*→/.test(name(n))) rows.push(n);
    });
    // match from the start of a word: "eth" finds Ethereum, not Tether
    const re = new RegExp('(^|[\\s/·(,])' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const hit = (r: DNode) => re.test((allText(r).join(' ') + ' ' + name(r).replace(/ →.*$/, '')).toLowerCase());
    const parents = new Set<DNode>();
    walk(root, n => { if (n.c?.some(c => rows.includes(c))) parents.add(n); });
    let shown = 0;
    let firstParent: DNode | null = null, firstAt = 0;
    parents.forEach(P => {
      const idx = P.c!.findIndex(c => rows.includes(c));
      if (!firstParent) { firstParent = P; firstAt = idx; }
      const kept = P.c!.filter(c => !rows.includes(c) || hit(c));
      shown += kept.filter(c => rows.includes(c)).length;
      // tidy dividers: none leading, trailing or doubled
      const tidy: DNode[] = [];
      kept.forEach(c => { if (isDivider(c) && (!tidy.length || isDivider(tidy[tidy.length - 1]))) return; tidy.push(c); });
      while (tidy.length && isDivider(tidy[tidy.length - 1])) tidy.pop();
      P.c = tidy;
    });
    if (!shown && firstParent) {
      const P = firstParent as DNode;
      P.c!.splice(Math.min(firstAt, P.c!.length), 0, emptyNode('search_off', 'No results', `Nothing matches “${f.v.trim()}”.`, pal, Math.min(P.w || 353, 353)));
    }
  }
}

// ---------- main ----------
export function transform(src: DNode, ctx: Ctx): { tree: DNode; fields: Field[] } {
  const { code, light, app } = ctx;
  const pal = palette(light);
  let root = clone(src);

  // support ticket with a picked file: the "file attached" frame, with the real file
  if ((code === 'R02' || code === 'R02a') && app.att) {
    const a = treeFor(CODE.R02a, light);
    if (a) root = clone(a);
    const kb = app.att.size != null ? (app.att.size >= 1048576 ? (app.att.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(app.att.size / 1024)) + ' KB') : 'Attached';
    walk(root, n => { if (n.t === 'T') mapSegs(n, s => s.replace('screenshot_0410.jpg', app.att!.name).replace(/^248 KB/, kb)); });
  }
  if (/^R02/.test(code)) walk(root, n => { if (/^button\/primary Create ticket/.test(name(n))) n.ax = 'att-clear'; });

  if (COIN_SCREENS.test(code)) coinize(root, app.coin, pal);

  if (app.country !== 'Czechia' && code !== 'B16') {
    const c = COUNTRIES[app.country];
    if (c) walk(root, n => { if (n.t === 'T') mapSegs(n, s => s.replace(/\bCZ \+420\b/g, `${c.iso} ${c.dial}`).replace(/\+420(?=\s|$)/g, c.dial)); });
  }
  if (code === 'B16') {
    const rc = radioColors(root);
    walk(root, n => {
      const m = /^row (.+) → back$/.exec(name(n));
      if (m && COUNTRIES[m[1]]) { n.ax = 'country ' + m[1]; setRadio(n, app.country === m[1], rc); }
    });
  }

  if (code === 'D01f') favouritesList(root, app, light, pal);
  stars(root, app, pal, /^D04/.test(code) ? app.coin : undefined);

  if (/^G01/.test(code)) p2pList(root, app, pal);
  if (/^G(08|11|14)$/.test(code)) p2pSheets(root, code, app, ctx.fv);

  if (code === 'Z09') walk(root, n => {
    if (/^row Take a photo/.test(name(n))) n.ax = 'pick camera';
    if (/^row Choose from gallery/.test(name(n))) n.ax = 'pick gallery';
    if (/^row Browse files/.test(name(n))) n.ax = 'pick files';
  });

  const fs = fields(root, ctx, pal);
  if (code === 'G14' && fs[0]) {
    const f = fs[0];
    f.bind = 'pendAmount';
    f.r = 1;
    f.v = app.pend.amount != null ? fmt(app.pend.amount, 0) : '';
    f.ph = f.ph || 'Enter amount';
    f.vc = pal.text;
  }
  totals(root, fs);

  // ½ / ×2 next to a bet, order-book prices into the price field
  walk(root, n => {
    if (n.pd !== 'self' || n.ax) return;
    const t = allText(n);
    if (t.length === 1 && t[0] === '½') n.ax = 'half';
    else if (t.length === 1 && t[0] === '×2') n.ax = 'double';
    else if (t.length === 1 && /^[\d,]+\.\d+$/.test(t[0]) && fs.some(f => f.stp)) n.ax = 'price ' + t[0];
  });

  searchFilter(root, fs, pal);
  return { tree: root, fields: fs };
}
