// Renders one exported Figma node as React Native.
// Auto-layout frames become flex boxes; everything else is absolutely positioned
// inside its parent, exactly like Figma. All design units are multiplied by `s`.
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { DNode, Seg, SVG } from '@/design/data';
import { color, fills, gradient } from './paint';

export type Env = {
  s: number;
  interactive: boolean;
  act: (n: DNode, env: Env) => void;
  code: string;
  inTabBar?: boolean;
  /** C07 appearance rows: whether this row is the selected mode */
  sel?: boolean;
  selColors?: { on: string; off: string };
  /** C05 menu: text that shows the current appearance label */
  apLabel?: string;
  /** current appearance, as the C07 row label */
  mode?: string;
  /** bumped when the app sets a field value (½, ×2, steppers…) so focused inputs take it */
  rev?: number;
  onField?: (k: string, v: string) => void;
};

type Parent = { lm?: 'H' | 'V' } | null;

const WEIGHT: Record<string, string> = {
  Thin: '400Regular', ExtraLight: '400Regular', Light: '400Regular', Regular: '400Regular',
  Medium: '500Medium', SemiBold: '600SemiBold', Bold: '700Bold', ExtraBold: '700Bold', Black: '700Bold',
};
export function fontFamily(style: string) {
  if (style.startsWith('M') && style !== 'Medium') {
    const w = WEIGHT[style.slice(1)] ?? '400Regular';
    return 'SUSEMono_' + (w === '600SemiBold' ? '500Medium' : w);
  }
  // Non-SUSE families (rare) fall back to SUSE at the same weight.
  const key = Object.keys(WEIGHT).find(k => style.endsWith(k)) ?? 'Regular';
  return 'SUSE_' + WEIGHT[key];
}

const isLink = (n: DNode) => !!(n.to || n.pd);

/** Size + position of a node relative to its parent (Figma sizing rules -> flex). */
function place(n: DNode, parent: Parent, s: number): ViewStyle {
  const st: ViewStyle = {};
  if (parent && parent.lm && n.x === undefined) {
    const zH = n.z?.[0] ?? 'F', zV = n.z?.[1] ?? 'F';
    const horiz = parent.lm === 'H';
    // primary axis
    if (n.gr) { st.flexGrow = 1; st.flexShrink = 1; st.flexBasis = 0; }
    else st.flexShrink = 0;
    if (horiz) {
      if (!n.gr && zH !== 'H') st.width = n.w * s;
      if (n.st) st.alignSelf = 'stretch'; else if (zV !== 'H') st.height = n.h * s;
    } else {
      if (!n.gr && zV !== 'H') st.height = n.h * s;
      if (n.st) st.alignSelf = 'stretch'; else if (zH !== 'H') st.width = n.w * s;
    }
    if (n.gr) { if (horiz) st.minWidth = 0; else st.minHeight = 0; }
  } else if (parent) {
    st.position = 'absolute';
    st.left = (n.x ?? 0) * s;
    st.top = (n.y ?? 0) * s;
    st.width = n.w * s;
    st.height = n.h * s;
  } else {
    st.width = n.w * s;
    st.height = n.h * s;
  }
  if (n.op != null) st.opacity = n.op;
  if (n.rot) st.transform = [{ rotate: `${-n.rot}deg` }];
  return st;
}

function radius(n: DNode, s: number): ViewStyle {
  if (n.t === 'E') return { borderRadius: (Math.min(n.w, n.h) / 2) * s };
  if (n.r == null) return {};
  if (typeof n.r === 'number') return { borderRadius: n.r * s };
  const [tl, tr, br, bl] = n.r;
  return { borderTopLeftRadius: tl * s, borderTopRightRadius: tr * s, borderBottomRightRadius: br * s, borderBottomLeftRadius: bl * s };
}

function border(n: DNode, s: number): { st: ViewStyle; w: number[] } {
  if (!n.s) return { st: {}, w: [0, 0, 0, 0] };
  const c = color(n.s.c);
  const ws = n.s.ws ?? [n.s.w ?? 1, n.s.w ?? 1, n.s.w ?? 1, n.s.w ?? 1];
  const px = ws.map(v => (v > 0 ? Math.max(v * s, StyleSheet.hairlineWidth) : 0));
  return {
    st: {
      borderColor: c,
      borderTopWidth: px[0], borderRightWidth: px[1], borderBottomWidth: px[2], borderLeftWidth: px[3],
      borderStyle: n.s.d ? 'dashed' : 'solid',
    },
    w: px,
  };
}

function shadow(n: DNode, s: number): ViewStyle {
  if (!n.sd) return {};
  const [hex, a, x, y, r] = n.sd;
  return { boxShadow: `${x * s}px ${y * s}px ${r * s}px ${color([hex, a])}` } as ViewStyle;
}

/** Background: a single solid becomes backgroundColor; anything else becomes stacked layers. */
function background(n: DNode, s: number) {
  const list = fills(n.f);
  if (list.length === 1 && !(typeof list[0] === 'object' && !Array.isArray(list[0]))) {
    return { st: { backgroundColor: color(list[0]) } as ViewStyle, layers: null };
  }
  if (!list.length) return { st: {}, layers: null };
  const r = radius(n, s);
  const layers = list.map((p, i) => {
    const g = gradient(p);
    if (g) return <LinearGradient key={i} pointerEvents="none" colors={g.colors as any} locations={g.locations as any} start={g.start} end={g.end} style={[StyleSheet.absoluteFill, r]} />;
    const c = color(p);
    return c ? <View key={i} pointerEvents="none" style={[StyleSheet.absoluteFill, r, { backgroundColor: c }]} /> : null;
  });
  return { st: {}, layers };
}

function lineHeight(v: number | string | undefined, fs: number, s: number) {
  if (v === undefined || v === 0) return fs * 1.35 * s;
  if (typeof v === 'number') return v * s;
  if (v.startsWith('p')) return (fs * parseFloat(v.slice(1)) / 100) * s;
  return undefined; // 'a' = auto
}

function segStyle(sg: Seg, s: number): TextStyle {
  const [, style, fs, paint, lh, ls, dc] = sg;
  const st: TextStyle = { fontFamily: fontFamily(style), fontSize: fs * s, color: color(paint) };
  const l = lineHeight(lh, fs, s);
  if (l) st.lineHeight = l;
  if (ls) st.letterSpacing = ls * s;
  if (dc === 1) st.textDecorationLine = 'underline';
  if (dc === 2) st.textDecorationLine = 'line-through';
  return st;
}

const TA: Record<string, TextStyle['textAlign']> = { C: 'center', R: 'right', J: 'justify' };

function TextNode({ n, pos, env }: { n: DNode; pos: ViewStyle; env: Env }) {
  const s = env.s;
  let sg = n.sg ?? [];
  if (env.apLabel && sg.length === 1 && /^(Dark|Light|Automatic)$/.test(sg[0][0])) sg = [[env.apLabel, ...sg[0].slice(1)] as Seg];
  const auto = !n.ar; // WIDTH_AND_HEIGHT: hug
  const st: TextStyle = { ...(pos as TextStyle), includeFontPadding: false };
  if (auto && st.position === 'absolute') {
    // absolute hug text: give it a touch of slack so font metrics never force a wrap
    st.width = (n.w + 2) * s;
    if (n.ta === 'C') st.left = ((n.x ?? 0) - 1) * s;
    else if (n.ta === 'R') st.left = ((n.x ?? 0) - 2) * s;
    delete st.height;
  }
  if (n.ar === 'H') delete st.height;
  if (n.ta) st.textAlign = TA[n.ta];
  if (n.va === 'C') st.textAlignVertical = 'center';
  if (n.va === 'B') st.textAlignVertical = 'bottom';
  if (sg.length === 1) {
    return <Text style={[segStyle(sg[0], s), st]} numberOfLines={n.tr || (auto ? 0 : undefined)}>{sg[0][0]}</Text>;
  }
  return (
    <Text style={[segStyle(sg[0], s), st]} numberOfLines={n.tr}>
      {sg.map((g, i) => <Text key={i} style={segStyle(g, s)}>{g[0]}</Text>)}
    </Text>
  );
}

/** An input field drawn in the design: the text node becomes a TextInput in the same type style. */
function FieldText({ n, pos, env }: { n: DNode; pos: ViewStyle; env: Env }) {
  const f = n.in!;
  const s = env.s;
  const g = n.sg![0];
  const [val, setVal] = useState(f.v);
  const focused = useRef(false);
  const lastRev = useRef(env.rev);
  useEffect(() => {
    // follow values the app sets, but never fight the user's typing
    if (!focused.current || lastRev.current !== env.rev) setVal(f.v);
    lastRev.current = env.rev;
  }, [f.v, env.rev]);
  const base = segStyle(g, s);
  const st: TextStyle = { ...(pos as TextStyle), ...base, color: f.vc, includeFontPadding: false };
  delete st.height;
  delete st.lineHeight;
  if (!env.interactive) {
    return <Text style={[st, !f.v && { color: color(g[3]) }]} numberOfLines={1}>{f.kind === 'secure' && f.v ? '•'.repeat(f.v.length) : f.v || f.ph}</Text>;
  }
  return (
    <TextInput
      value={val}
      onChangeText={t => { setVal(t); env.onField?.(f.k, t); }}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; }}
      placeholder={f.ph}
      placeholderTextColor={color(g[3])}
      selectionColor="#58F9B0"
      cursorColor="#58F9B0"
      keyboardType={f.kind === 'num' ? (f.dec || /,/.test(f.v) ? 'decimal-pad' : 'number-pad') : 'default'}
      secureTextEntry={f.kind === 'secure'}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType={f.kind === 'search' ? 'search' : 'done'}
      underlineColorAndroid="transparent"
      style={[st, { paddingVertical: 0, paddingHorizontal: 0, margin: 0, minWidth: 40 * s, height: Math.max(n.h || 0, g[2] * 1.4) * s }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
    />
  );
}

function IconNode({ n, pos, env }: { n: DNode; pos: ViewStyle; env: Env }) {
  const s = env.s;
  let ic = n.ic ?? 'help';
  let c = color(n.f as any) ?? '#FFFFFF';
  if (env.sel !== undefined && env.selColors && /^(check_circle|radio_button_unchecked|radio_button_checked)$/.test(ic)) {
    ic = env.sel ? 'check_circle' : 'radio_button_unchecked';
    c = env.sel ? env.selColors.on : env.selColors.off;
  }
  const size = (n.fs ?? 24) * s;
  const st: ViewStyle = { ...pos, width: Math.max(n.w, n.fs ?? 0) * s, height: Math.max(n.h, n.fs ?? 0) * s, alignItems: 'center', justifyContent: 'center' };
  return (
    <View style={st} pointerEvents="none">
      <MaterialIcons name={ic.replace(/_/g, '-') as any} size={size} color={c} style={{ includeFontPadding: false, lineHeight: size } as TextStyle} />
    </View>
  );
}

function childEnv(n: DNode, env: Env): Env {
  if (n.n === 'tab bar') return { ...env, inTabBar: true };
  if (env.code === 'C07' && n.n) {
    const m = /^row (Automatic|Dark|Light) → back$/.exec(n.n);
    if (m) return { ...env, sel: env.mode === m[1] };
  }
  if (env.code === 'C05' && n.n?.startsWith('row Appearance')) return { ...env, apLabel: env.mode };
  return env;
}

export const Node = memo(function Node({ n, parent, env }: { n: DNode; parent: Parent; env: Env }) {
  const s = env.s;
  if (n.t === 'X') return null;
  const pos = place(n, parent, s);
  const link = env.interactive && isLink(n);
  const cenv = childEnv(n, env);

  let el: React.ReactElement | null = null;
  if (n.t === 'T') el = n.in ? <FieldText n={n} pos={pos} env={cenv} /> : <TextNode n={n} pos={link ? {} : pos} env={cenv} />;
  else if (n.t === 'I') el = <IconNode n={n} pos={link ? {} : pos} env={cenv} />;
  else if (n.t === 'S') {
    const xml = n.svg ? SVG[n.svg] : undefined;
    el = xml
      ? <SvgXml xml={xml} width={n.w * s} height={n.h * s} style={link ? undefined : (pos as any)} />
      : <View style={link ? { width: n.w * s, height: n.h * s } : pos} />;
  } else {
    // F, R, E
    const bg = background(n, s);
    const bd = border(n, s);
    const st: ViewStyle = { ...pos, ...bg.st, ...radius(n, s), ...bd.st, ...shadow(n, s) };
    if (n.cl || (bg.layers && (n.r || n.t === 'E'))) st.overflow = 'hidden';
    if (n.t === 'F' && n.lm) {
      st.flexDirection = n.lm === 'H' ? 'row' : 'column';
      const p = n.p ?? [0, 0, 0, 0];
      st.paddingTop = Math.max(0, p[0] * s - bd.w[0]);
      st.paddingRight = Math.max(0, p[1] * s - bd.w[1]);
      st.paddingBottom = Math.max(0, p[2] * s - bd.w[2]);
      st.paddingLeft = Math.max(0, p[3] * s - bd.w[3]);
      if (n.g) st.gap = n.g * s;
      if (n.pa === 'C') st.justifyContent = 'center';
      else if (n.pa === 'B') st.justifyContent = 'space-between';
      if (n.ca === 'C') st.alignItems = 'center';
      else if (n.ca === 'L') st.alignItems = 'baseline';
      else st.alignItems = 'flex-start';
      if (n.wr) { st.flexWrap = 'wrap'; st.rowGap = (n.cg ?? 0) * s; }
    }
    const kids = n.c?.map((c, i) => <Node key={i} n={c} parent={n.t === 'F' ? { lm: n.lm } : { lm: undefined }} env={cenv} />);
    if (link) {
      return (
        <Pressable
          onPress={() => env.act(n, cenv)}
          hitSlop={n.w < 40 || n.h < 40 ? 8 : undefined}
          style={({ pressed }) => [st, pressed && { opacity: (n.op ?? 1) * 0.6 }]}
        >
          {bg.layers}
          {kids}
        </Pressable>
      );
    }
    return <View style={st} pointerEvents={env.interactive ? 'auto' : 'none'}>{bg.layers}{kids}</View>;
  }

  if (!link) return el;
  // leaf with a link: the Pressable takes the placement, the leaf renders inside it
  return (
    <Pressable onPress={() => env.act(n, cenv)} hitSlop={10} style={({ pressed }) => [pos, pressed && { opacity: 0.6 }]}>
      {el}
    </Pressable>
  );
});
