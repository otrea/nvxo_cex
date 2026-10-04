// Design data exported from Figma (wVlDFac6AMFxay2jcgVajH) by tools/figma-export.js.
// Dark screens carry a full node tree; Light screens carry a patch against their Dark base.
import rawScreens from './screens.json';
import rawSvg from './svg.json';

export type Paint = string | [string, number] | { g: [number, string, number][]; m: number[][]; o: number } | { img: 1 };
export type Seg = [string, string, number, Paint | null, (number | string)?, number?, number?];
export type Stroke = { c: Paint; w?: number; ws?: number[]; d?: 1; a?: string };
export type DNode = {
  t: 'F' | 'T' | 'I' | 'S' | 'R' | 'E' | 'X';
  x?: number; y?: number; w: number; h: number;
  z?: string; gr?: 1; st?: 1; op?: number; rot?: number;
  to?: string; auto?: [string, number]; pd?: string; n?: string;
  // text
  sg?: Seg[]; ta?: string; va?: string; ar?: string; tr?: number;
  // icon
  ic?: string; fs?: number;
  // svg
  svg?: string;
  // frame
  f?: Paint[] | Paint; r?: number | number[]; s?: Stroke; cl?: 1; lm?: 'H' | 'V';
  p?: number[]; g?: number; pa?: string; ca?: string; wr?: 1; cg?: number;
  sd?: [string, number, number, number, number];
  c?: DNode[];
  ref?: string;
  // added at runtime by src/render/transform.ts
  /** editable field (on the field's text node) */
  in?: Field;
  /** app action for a tap, e.g. "fav BTC", "pick camera", "step f0 1" */
  ax?: string;
};
export type Field = {
  k: string;
  v: string;
  ph: string;
  kind: 'num' | 'text' | 'secure' | 'search';
  /** colour of typed text */
  vc: string;
  dec: number;
  /** a change re-renders the screen (search, live totals, store-bound) */
  r?: 1;
  bind?: 'pendAmount';
  /** has − / + steppers */
  stp?: 1;
};
type RawScreen = { id: string; name: string; tree?: DNode; base?: string; patch?: any };

const screens = rawScreens as unknown as Record<string, RawScreen>;
export const SVG = rawSvg as unknown as Record<string, string>;

export const codeOf = (name: string) => name.split(' · ')[0];

/** dark screen id -> meta */
export const DARK: Record<string, { id: string; name: string; code: string; tree: DNode }> = {};
/** design code (A01, F20 …) -> dark id */
export const CODE: Record<string, string> = {};
/** dark id -> light id */
const LIGHT_OF: Record<string, string> = {};
/** any id (dark or light) -> dark id */
const TO_DARK: Record<string, string> = {};

for (const id in screens) {
  const s = screens[id];
  if (!s.base && s.tree) {
    const code = codeOf(s.name);
    DARK[id] = { id, name: s.name, code, tree: s.tree };
    CODE[code] = id;
    TO_DARK[id] = id;
  }
}
for (const id in screens) {
  const s = screens[id];
  if (s.base) {
    LIGHT_OF[s.base] = id;
    TO_DARK[id] = s.base;
    const lc = codeOf(s.name);
    if (!CODE[lc]) CODE[lc] = s.base; // "F20L" also resolves to the base screen
  }
}

export const toDark = (id: string) => TO_DARK[id] ?? id;

function merge(base: any, patch: any): any {
  if (patch === undefined) return base;
  if (patch === null) return undefined;
  if (Array.isArray(patch) || typeof patch !== 'object') return patch;
  if (patch['~'] === 1 && Array.isArray(base)) {
    return base.map((b: any, i: number) => (i in patch ? merge(b, patch[i]) : b));
  }
  if (!base || typeof base !== 'object' || Array.isArray(base)) return patch;
  const out: any = { ...base };
  for (const k in patch) {
    const v = merge(base[k], patch[k]);
    if (v === undefined) delete out[k];
    else out[k] = v;
  }
  return out;
}

const lightCache: Record<string, DNode> = {};
export function treeFor(darkId: string, light: boolean): DNode | undefined {
  const d = DARK[darkId];
  if (!d) return undefined;
  if (!light) return d.tree;
  const lid = LIGHT_OF[darkId];
  if (!lid) return d.tree;
  if (!lightCache[darkId]) lightCache[darkId] = merge(d.tree, screens[lid].patch) as DNode;
  return lightCache[darkId];
}

export const START_ID = CODE['A01'];
export const HOME_ID = CODE['C01'] ?? START_ID;
