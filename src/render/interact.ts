// Local tap state for prototype links that stay on the same screen ("self").
// The design has one frame per state, so we derive the other state from the design itself:
// - selection groups (chips, segments, tabs, radio rows, calendar days): the tapped item takes the
//   look of the currently active item and vice versa
// - multi-select chips: the tapped chip takes the look of the other group
// - toggles, checkboxes, stars, eye icons: flip
// Everything else gets a short confirmation toast.
import type { DNode, Seg } from '@/design/data';

export type UIState = { sel: Record<string, string>; flip: Record<string, boolean> };
export const EMPTY: UIState = { sel: {}, flip: {} };

const MINT = '#58F9B0';
const key = (p: number[]) => p.join('.');
// hug-sized nodes carry no w/h in the export: two missing sizes count as equal
const near = (a: number | undefined, b: number | undefined, tol: number) => (a === undefined || b === undefined ? a === b : Math.abs(a - b) < tol);
const at = (t: DNode, p: number[]) => p.reduce<DNode | undefined>((n, i) => n?.c?.[i], t);
const firstFill = (n: DNode) => { const f = n.f; if (!f) return undefined; const p = Array.isArray(f) && !(f.length === 2 && typeof f[1] === 'number') ? f[0] : f; return typeof p === 'string' ? p : Array.isArray(p) ? p[0] : 'grad'; };

// ---------- classifiers ----------
export const isToggle = (n: DNode) => n.t === 'F' && n.w >= 40 && n.w <= 52 && n.h >= 24 && n.h <= 32 && (n.r as number) >= 12 && !!n.c?.some(c => c.t === 'E');
export const isCheck = (n: DNode) => n.t === 'F' && n.w >= 18 && n.w <= 24 && Math.abs(n.w - n.h) < 1 && typeof n.r === 'number' && n.r <= 8
  && ((firstFill(n) === MINT && !!n.c?.some(c => c.t === 'I' && c.ic === 'check')) || (!n.f && !!n.s && !n.c?.length));
const STAR = /^star(_border|_outline)?$/;
function findIn(n: DNode, pred: (x: DNode) => boolean, path: number[] = []): number[] | null {
  if (pred(n)) return path;
  const c = n.c ?? [];
  for (let i = 0; i < c.length; i++) { const r = findIn(c[i], pred, path.concat(i)); if (r) return r; }
  return null;
}
function sig(n: DNode): string {
  const t = findIn(n, x => x.t === 'T'), i = findIn(n, x => x.t === 'I');
  const tn = t ? at(n, t)! : undefined, iN = i ? at(n, i)! : undefined;
  const ind = n.c?.find(c => c.t === 'R' && c.h <= 4);
  return JSON.stringify([n.f ?? null, n.s ?? null, tn?.sg?.[0]?.slice(1, 4) ?? null, iN ? [iN.ic, iN.f] : null, ind ? [ind.w, ind.f ?? null] : null]);
}

export type Interaction =
  | { kind: 'sel'; group: string; target: string }
  | { kind: 'flip'; target: string }
  | { kind: 'none' };

/** Decide what a self-tap on the node at `path` does, using the ORIGINAL (unmodified) tree. */
export function classify(tree: DNode, path: number[]): Interaction {
  const n = at(tree, path); if (!n) return { kind: 'none' };
  if (findIn(n, isToggle) || findIn(n, isCheck)) return { kind: 'flip', target: key(path) };
  if (n.t === 'I' && (STAR.test(n.ic ?? '') || /^visibility(_off)?$/.test(n.ic ?? ''))) return { kind: 'flip', target: key(path) };
  // selection group among siblings (or cousins, for grids like the calendar)
  // calendar days form one group across the week rows
  for (const up of /^day /.test(n.n ?? '') ? [2] : [1, 2]) {
    if (path.length < up) break;
    const gp = path.slice(0, path.length - up);
    const G = at(tree, gp)!;
    const cands: number[][] = [];
    if (up === 1) (G.c ?? []).forEach((c, i) => { if (c.t === 'F' && near(c.h, n.h, 2) && near(c.w, n.w, 200)) cands.push(gp.concat(i)); });
    else (G.c ?? []).forEach((row, i) => (row.c ?? []).forEach((c, j) => { if (c.t === 'F' && near(c.h, n.h, 2) && near(c.w, n.w, 2) && (c.c?.length ?? 0) > 0) cands.push(gp.concat(i, j)); }));
    if (cands.length < 2 || !cands.some(p => key(p) === key(path))) continue;
    const groups: Record<string, string[]> = {};
    cands.forEach(p => (groups[sig(at(tree, p)!)] = groups[sig(at(tree, p)!)] || []).push(key(p)));
    const gs = Object.values(groups);
    if (gs.length !== 2) continue;
    const minority = gs[0].length <= gs[1].length ? gs[0] : gs[1];
    if (minority.length === 1) return { kind: 'sel', group: key(gp), target: key(path) };
    return { kind: 'flip', target: key(path) };
  }
  return { kind: 'none' };
}

// ---------- restyling ----------
export function restyle(t: DNode, src: DNode): DNode {
  const o: DNode = { ...t, f: src.f, s: src.s, op: src.op };
  if (t.t === 'T' && src.t === 'T' && t.sg && src.sg) o.sg = t.sg.map((g, i) => [g[0], ...src.sg![Math.min(i, src.sg!.length - 1)].slice(1)] as Seg);
  if (t.t === 'I' && src.t === 'I') { o.f = src.f; if (/radio|check/.test(src.ic ?? '')) o.ic = src.ic; }
  if (t.t === 'R' && src.t === 'R' && t.h <= 4) o.w = src.w;
  if (t.c && src.c) o.c = t.c.map((c, i) => (src.c![i] && src.c![i].t === c.t ? restyle(c, src.c![i]) : c));
  return o;
}

function flipNode(n: DNode, light: boolean, tree: DNode, path: string): DNode {
  const tp = findIn(n, isToggle);
  if (tp) return updateAt(n, tp, tg => {
    const on = firstFill(tg) === MINT;
    const kid = tg.c!.findIndex(c => c.t === 'E'), k = tg.c![kid];
    const knob: DNode = { ...k, x: on ? 3 : tg.w - 3 - k.w, f: [on ? '#FFFFFF' : '#000000'] };
    return { ...tg, f: [on ? (light ? '#E2E0E8' : '#2A2B33') : MINT], c: tg.c!.map((c, i) => (i === kid ? knob : c)) };
  });
  const cp = findIn(n, isCheck);
  if (cp) return updateAt(n, cp, ck => {
    const on = firstFill(ck) === MINT;
    return on
      ? { ...ck, f: undefined, s: { c: light ? '#8E8E99' : '#7C7D86', w: 1.5 }, c: [] }
      : { ...ck, f: [MINT], s: undefined, c: [{ t: 'I', ic: 'check', fs: 18, f: '#000000', x: 2, y: 2, w: 18, h: 18 }] };
  });
  if (n.t === 'I' && STAR.test(n.ic ?? '')) {
    const on = n.ic === 'star';
    return { ...n, ic: on ? 'star_border' : 'star', f: on ? (light ? '#6B6B78' : '#7C7D86') : (light ? '#000019' : MINT) };
  }
  if (n.t === 'I' && /^visibility/.test(n.ic ?? '')) return { ...n, ic: n.ic === 'visibility' ? 'visibility_off' : 'visibility' };
  // multi-select chip: take the look of a sibling from the other style group
  const p = path.split('.').map(Number); const parent = at(tree, p.slice(0, -1));
  const other = parent?.c?.find(c => c.t === 'F' && near(c.h, n.h, 2) && sig(c) !== sig(n));
  return other ? restyle(n, other) : n;
}

function updateAt(n: DNode, p: number[], fn: (x: DNode) => DNode): DNode {
  if (!p.length) return fn(n);
  return { ...n, c: n.c!.map((c, i) => (i === p[0] ? updateAt(c, p.slice(1), fn) : c)) };
}

/** Apply the tap state to a tree; returns a new tree plus a node -> path index for tap handling. */
export function applyState(tree: DNode, st: UIState, light: boolean) {
  let t = tree;
  for (const g in st.sel) {
    const target = st.sel[g];
    const gp = g === '' ? [] : g.split('.').map(Number);
    const tp = target.split('.').map(Number);
    const up = tp.length - gp.length;
    // find the originally active item of this group
    const cands: number[][] = [];
    const G = at(tree, gp)!;
    const ref = at(tree, tp)!;
    if (up === 1) (G.c ?? []).forEach((c, i) => { if (c.t === 'F' && near(c.h, ref.h, 2) && near(c.w, ref.w, 200)) cands.push(gp.concat(i)); });
    else (G.c ?? []).forEach((row, i) => (row.c ?? []).forEach((c, j) => { if (c.t === 'F' && near(c.h, ref.h, 2) && near(c.w, ref.w, 2) && (c.c?.length ?? 0) > 0) cands.push(gp.concat(i, j)); }));
    const groups: Record<string, number[][]> = {};
    cands.forEach(p => (groups[sig(at(tree, p)!)] = groups[sig(at(tree, p)!)] || []).push(p));
    const active = Object.values(groups).find(x => x.length === 1)?.[0];
    if (!active || key(active) === target) continue;
    const A = at(tree, active)!, B = ref;
    t = updateAt(t, active, x => restyle(x, B));
    t = updateAt(t, tp, x => restyle(x, A));
  }
  for (const k in st.flip) if (st.flip[k]) {
    const p = k.split('.').map(Number);
    t = updateAt(t, p, x => flipNode(x, light, tree, k));
  }
  // index paths, and make unlinked toggles / checkboxes tappable
  const pathOf = new WeakMap<DNode, string>();
  const walk = (n: DNode, p: number[]): DNode => {
    const o: DNode = { ...n };
    if (!o.to && !o.pd && (isToggle(o) || isCheck(o))) o.pd = 'self';
    if (o.c) o.c = o.c.map((c, i) => walk(c, p.concat(i)));
    pathOf.set(o, key(p));
    return o;
  };
  return { tree: walk(t, []), pathOf };
}

/** Confirmation text for self-taps that have no visual state of their own. */
export function selfToast(n: DNode): string | null {
  const name = (n.n ?? '').replace(/ → .*$/, '');
  const text = (() => { const o: string[] = []; (function w(x: DNode) { if (x.t === 'T') o.push(x.sg!.map(s => s[0]).join('')); (x.c ?? []).forEach(w); })(n); return o.join(' '); })();
  if (/MAX/.test(name) || text === 'MAX') return 'Maximum amount filled';
  if (/Paste|content_paste/.test(name)) return 'Pasted from clipboard';
  if (/Get code|Resend/.test(name) || /Resend/.test(text)) return 'Verification code sent';
  if (/icon\/send/.test(name)) return 'Message sent';
  if (/Mark all as read/.test(name)) return 'All notifications marked as read';
  if (/Previous|Next/.test(name)) return 'Page updated';
  if (/month/.test(name)) return 'Month changed';
  if (/Reset|Clear|icon\/cancel/.test(name)) return 'Cleared';
  if (/icon\/close/.test(name)) return 'File removed';
  if (/Torch/.test(name)) return 'Torch switched on';
  if (/^[\d,.\s]+$/.test(name)) return `Price set to ${name.trim()}`;
  if (/^[\d,.\s]+$/.test(text.split(' ')[0] || '')) return `Price set to ${text.split(' ')[0]}`;
  return null;
}
