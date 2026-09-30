import type { Paint } from '@/design/data';

const hexA = (hex: string, a: number) => {
  if (a >= 0.995) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.round(a * 1000) / 1000})`;
};

/** Solid colour for any paint (gradients collapse to their first stop). */
export function color(p: Paint | null | undefined): string | undefined {
  if (!p) return undefined;
  if (typeof p === 'string') return p;
  if (Array.isArray(p)) return hexA(p[0], p[1]);
  if ('g' in p) return hexA(p.g[0][1], p.g[0][2] * p.o);
  return undefined;
}

export type Grad = { colors: string[]; locations: number[]; start: { x: number; y: number }; end: { x: number; y: number } };

/** Figma gradientTransform -> expo-linear-gradient start/end (inverse-mapped handles). */
export function gradient(p: Paint): Grad | null {
  if (!p || typeof p !== 'object' || Array.isArray(p) || !('g' in p)) return null;
  const [[a, b, c], [d, e, f]] = p.m;
  const det = a * e - b * d || 1;
  const inv = (x: number, y: number) => {
    const X = x - c, Y = y - f;
    return { x: (e * X - b * Y) / det, y: (-d * X + a * Y) / det };
  };
  const stops = p.g.length > 1 ? p.g : [p.g[0], p.g[0]];
  return {
    colors: stops.map(s => hexA(s[1], s[2] * p.o)),
    locations: stops.map((s, i) => (p.g.length > 1 ? s[0] : i)),
    start: inv(0, 0.5),
    end: inv(1, 0.5),
  };
}

/** Frames carry a list of paints; a single [hex, opacity] tuple is one paint, not a list. */
export const fills = (f: Paint[] | Paint | undefined): Paint[] => {
  if (!f) return [];
  if (Array.isArray(f) && !(f.length === 2 && typeof f[1] === 'number')) return f as Paint[];
  return [f as Paint];
};
