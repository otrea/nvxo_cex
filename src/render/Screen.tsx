// Composes one design screen for a real device: the Figma status bar and home indicator
// give way to the device's safe areas, the header and footer/tab bar are pinned,
// the content scrolls, and sheets sit on top of the screen they reference.
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { CODE, DARK, DNode, Field, HOME_ID, toDark, treeFor } from '@/design/data';
import { modeLabel, useTheme } from '@/theme/theme';
import { COINS, decimalsOf, fmt, parseNum } from './coins';
import { applyState, classify, EMPTY, selfToast, UIState } from './interact';
import { color, fills } from './paint';
import { Env, Node } from './Node';
import { Attachment, getState, setState, toggleFav, useAppState } from './store';
import { COIN_SCREENS, transform } from './transform';

const DESIGN_W = 393;
const MAX_COL = 440;
const STATUS_H = 50;

export const enc = (id: string) => id.replace(':', '_');
export const dec = (id: string) => id.replace('_', ':');

const isSheetTree = (t?: DNode) => !!t?.c?.some(c => c.n === 'sheet');
const isSheet = (id: string) => isSheetTree(DARK[id]?.tree);
/** C01 / C01g / C01n, D04 / D04q … are one screen in different states */
const family = (code: string) => code.replace(/[a-z]+$/, '');

// The interactive screens currently mounted, bottom to top — mirrors the navigation stack, so a
// link to a screen that is already open goes back to it instead of piling up history.
const STACK: { id: string }[] = [];
// scroll position handed from a screen to its replacement in the same family
let carryScroll: number | null = null;

export function go(id: string, how: 'push' | 'replace' | 'tab' = 'push') {
  const dark = toDark(id);
  if (!DARK[dark]) return;
  const top = STACK[STACK.length - 1];
  if (how !== 'replace' && top) {
    if (top.id === dark) { carryScroll = null; return; }
    for (let i = STACK.length - 2; i >= 0; i--) {
      if (STACK[i].id === dark) { carryScroll = null; router.dismiss(STACK.length - 1 - i); return; }
    }
    // leaving a sheet for another screen closes the sheet
    if (how === 'push' && isSheet(top.id)) how = 'replace';
  }
  const a = how === 'tab' ? 'none' : isSheetTree(DARK[dark].tree) ? 'fade' : 'slide_from_right';
  const href = { pathname: '/s/[id]' as const, params: { id: enc(dark), a } };
  if (how === 'push') router.push(href);
  else router.replace(href);
}

export function back() {
  if (router.canGoBack()) router.back();
  else go(HOME_ID, 'replace');
}

function label(n: DNode) {
  return (n.n ?? '')
    .replace(/ → .*$/, '')
    .replace(/^(row|link|button\/\w+|icon\/|icon-circle|seg|tab|banner|card|input)\s*/, '')
    .trim();
}

function toastText(n: DNode) {
  const name = n.n ?? '';
  const l = label(n);
  if (/content_copy/.test(name)) return 'Copied to clipboard';
  if (/ios_share|Share/.test(name)) return 'Share link copied';
  if (/block explorer/i.test(name)) return 'Opening block explorer…';
  if (/Website|Whitepaper/.test(name)) return 'Opening in your browser…';
  if (/Invite|icon-circle/.test(name)) return 'Invite link copied';
  if (/Notify me/.test(name)) return "We'll notify you when it starts";
  return l ? `${l} · done` : 'Done';
}

/** Solid colours used for the selected / unselected radio in a sheet (C07 appearance). */
function radioColors(t: DNode) {
  let on = '#58F9B0', off = '#7C7D86';
  const walk = (n: DNode) => {
    if (n.t === 'I' && n.ic === 'check_circle') on = color(n.f as any) ?? on;
    if (n.t === 'I' && n.ic === 'radio_button_unchecked') off = color(n.f as any) ?? off;
    n.c?.forEach(walk);
  };
  walk(t);
  return { on, off };
}

type Props = { id: string; interactive?: boolean };

const coinOf = (n: DNode) => { const m = /^(pair|tile) ([A-Z0-9]{2,6})\b/.exec(n.n ?? ''); return m && COINS[m[2]] ? m[2] : undefined; };
const sizeOk = (a: Attachment) => !a.size || a.size <= 5 * 1024 * 1024;

export function Screen({ id, interactive = true }: Props) {
  const { light, mode, setMode } = useTheme();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const landscape = win.width > win.height;

  // landscape variant of a screen (A01 -> A01h) when the phone is turned; only real landscape
  // frames count — E06h (order history) is a portrait screen that merely shares the suffix
  const meta = DARK[id];
  const hId = meta && CODE[meta.code + 'h'];
  const hTree = hId ? DARK[hId]?.tree : undefined;
  const useId = (landscape && hId && hTree && hTree.w > hTree.h && hId) || id;
  const raw = treeFor(useId, light);
  const app = useAppState();
  // typed field values: the ref always has the latest, the state re-renders when it matters
  const fvRef = useRef<Record<string, string>>({});
  const [fv, setFv] = useState<Record<string, string>>({});
  const [rev, setRev] = useState(0);
  const tcode = DARK[useId]?.code ?? meta?.code ?? '';
  const tx = useMemo(() => (raw ? transform(raw, { code: tcode, light, app, fv }) : null), [raw, tcode, light, app, fv]);
  const base = tx?.tree;
  const fieldsRef = useRef<Field[]>([]);
  useEffect(() => { fieldsRef.current = tx?.fields ?? []; }, [tx]);
  // local tap state (selected chips, flipped toggles…) for links that stay on this screen
  const [ui, setUi] = useState<UIState>(EMPTY);

  // register in the navigation stack mirror
  useEffect(() => {
    if (!interactive) return;
    const e = { id };
    STACK.push(e);
    return () => { const i = STACK.indexOf(e); if (i >= 0) STACK.splice(i, 1); };
  }, [id, interactive]);

  // keep the scroll position when a tab / chip swaps this screen for its sibling state
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [restoreY] = useState(() => { if (!interactive) return null; const y = carryScroll; carryScroll = null; return y; });
  const restored = useRef(false);
  const onContentSize = useCallback(() => {
    if (restoreY && !restored.current) { restored.current = true; scrollRef.current?.scrollTo({ y: restoreY, animated: false }); }
  }, [restoreY]);

  const fieldVal = useCallback((k: string) => fvRef.current[k] ?? fieldsRef.current.find(f => f.k === k)?.v ?? '', []);
  const setField = useCallback((k: string, v: string) => {
    fvRef.current = { ...fvRef.current, [k]: v };
    setFv(fvRef.current);
    setRev(r => r + 1);
  }, []);
  const onField = useCallback((k: string, v: string) => {
    fvRef.current = { ...fvRef.current, [k]: v };
    const f = fieldsRef.current.find(x => x.k === k);
    if (f?.bind === 'pendAmount') setState(st => ({ pend: { ...st.pend, amount: v.trim() ? parseNum(v) || null : null } }));
    else if (f?.r) setFv(fvRef.current);
  }, []);

  const pick = useCallback(async (kind: string) => {
    try {
      let a: Attachment | null = null;
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      if (kind === 'camera') {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) { toast('Camera access is off — allow it in Settings'); return; }
        const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (!r.canceled && r.assets[0]) a = { name: r.assets[0].fileName ?? `photo_${stamp}.jpg`, size: r.assets[0].fileSize ?? null };
      } else if (kind === 'gallery') {
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (!r.canceled && r.assets[0]) a = { name: r.assets[0].fileName ?? `image_${stamp}.jpg`, size: r.assets[0].fileSize ?? null };
      } else {
        const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png'], copyToCacheDirectory: false, multiple: false });
        if (!r.canceled && r.assets[0]) a = { name: r.assets[0].name, size: r.assets[0].size ?? null };
      }
      if (!a) return;
      if (!sizeOk(a)) { toast('That file is over 5 MB'); return; }
      setState(() => ({ att: a }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast('File attached');
      back();
    } catch {
      toast("Couldn't open the picker");
    }
  }, [toast]);

  /** App actions tagged by transform(); returns true when the tap is fully handled. */
  const doX = useCallback((x: string): boolean => {
    const cmd = x.split(' ')[0];
    const arg = x.slice(cmd.length + 1);
    const fs = fieldsRef.current;
    switch (cmd) {
      case 'fav': {
        const on = toggleFav(arg);
        Haptics.selectionAsync().catch(() => {});
        toast(on ? `${arg} added to favourites` : `${arg} removed from favourites`);
        return true;
      }
      case 'method':
        setState(st => ({ pend: { ...st.pend, method: arg === 'All payment methods' ? null : arg } }));
        return true;
      case 'amt':
        setState(st => ({ pend: { ...st.pend, amount: +arg } }));
        setRev(r => r + 1);
        return true;
      case 'cur': setState(st => ({ p2p: { ...st.p2p, cur: arg } })); return false;
      case 'country': setState(() => ({ country: arg })); return false;
      case 'p2p-apply': setState(st => ({ p2p: { ...st.p2p, amount: st.pend.amount, method: st.pend.method } })); return false;
      case 'p2p-clear': setState(st => ({ p2p: { ...st.p2p, amount: null }, pend: { ...st.pend, amount: null } })); return false;
      case 'att-clear': setState(() => ({ att: null })); return false;
      case 'pick': pick(arg); return true;
      case 'half':
      case 'double': {
        const f = fs.find(y => y.kind === 'num');
        if (!f) return false;
        const v = parseNum(fieldVal(f.k)) || 0;
        setField(f.k, fmt(cmd === 'half' ? v / 2 : v * 2, Math.max(f.dec, 2)));
        Haptics.selectionAsync().catch(() => {});
        return true;
      }
      case 'step': {
        const [k, d] = arg.split(' ');
        const f = fs.find(y => y.k === k);
        if (!f) return false;
        const dec = f.dec || 2;
        const v = parseNum(fieldVal(k)) || 0;
        setField(k, fmt(Math.max(0, v + +d * 10 ** -Math.max(1, dec - 1)), dec));
        Haptics.selectionAsync().catch(() => {});
        return true;
      }
      case 'price': {
        const f = fs.find(y => y.stp);
        if (f) setField(f.k, fmt(parseNum(arg), f.dec || decimalsOf(arg)));
        toast(`Price set to ${arg}`);
        return true;
      }
    }
    return false;
  }, [toast, pick, fieldVal, setField]);
  const applied = useMemo(() => (base ? applyState(base, ui, light) : null), [base, ui, light]);
  const tree = applied?.tree;

  // AFTER_TIMEOUT prototype links (splash -> onboarding)
  useEffect(() => {
    if (!interactive || !tree?.auto) return;
    const [target, secs] = tree.auto;
    const t = setTimeout(() => go(target, 'replace'), (secs > 50 ? secs : secs * 1000));
    return () => clearTimeout(t);
  }, [interactive, tree]);

  const env = useMemo<Env>(() => {
    const code = meta?.code ?? '';
    return {
      s: 1,
      interactive,
      code,
      mode: modeLabel(mode),
      rev,
      onField,
      selColors: tree ? radioColors(tree) : undefined,
      act: (n: DNode, e: Env) => {
        const pd = n.pd ?? '';
        const name = n.n ?? '';
        const theme = code === 'C07' && /^row (Automatic|Dark|Light) → back$/.exec(name);
        if (theme) {
          Haptics.selectionAsync().catch(() => {});
          setMode(theme[1] === 'Automatic' ? 'system' : theme[1] === 'Dark' ? 'dark' : 'light');
          back();
          return;
        }
        if (n.ax && doX(n.ax)) return;
        if (pd === 'toast') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); toast(toastText(n)); return; }
        if (pd === 'self' && !n.to) {
          Haptics.selectionAsync().catch(() => {});
          const path = applied?.pathOf.get(n);
          const it = base && path !== undefined ? classify(base, path === '' ? [] : path.split('.').map(Number)) : { kind: 'none' as const };
          if (it.kind === 'sel') setUi(u => ({ ...u, sel: { ...u.sel, [it.group]: it.target } }));
          else if (it.kind === 'flip') setUi(u => ({ ...u, flip: { ...u.flip, [it.target]: !u.flip[it.target] } }));
          else { const m = selfToast(n); if (m) toast(m); }
          return;
        }
        // a pair picked in the pair picker becomes the coin of the screen below
        const sym = coinOf(n);
        if (sym && /^D06/.test(code) && (n.to === 'back' || pd === 'back')) setState(() => ({ coin: sym }));
        if (n.to === 'back' || pd === 'back') { back(); return; }
        const to = n.to ?? (pd && CODE[pd]) ?? undefined;
        const target = to && toDark(to);  // light links point at light frames
        if (!target || !DARK[target]) return;
        const tc = DARK[target].code;
        if (sym && COIN_SCREENS.test(tc)) setState(() => ({ coin: sym }));
        if (tc === 'G08' || tc === 'G14') { const p = getState().p2p; setState(() => ({ pend: { amount: p.amount, method: p.method } })); }
        // same screen in another state (tabs on Home, chart timeframes, Buy/Sell…): swap in place
        if (tc !== code && family(tc) === family(code) && !isSheet(target) && !isSheet(id) && !/^(button\/|back)/.test(name)) {
          carryScroll = scrollY.current;
          go(target, 'tab');
          return;
        }
        const tabLike = e.inTabBar || /^(tab|seg) /.test(name);
        go(target, tabLike ? 'tab' : 'push');
      },
    };
  }, [meta, id, interactive, mode, setMode, toast, tree, base, applied, rev, onField, doX]);

  if (!tree) return <View style={{ flex: 1, backgroundColor: light ? '#FFFFFF' : '#000000' }} />;

  // screen background stays plain white / black — gradients live only on the big buttons
  const bg = color(fills(tree.f)[0]) ?? (light ? '#FFFFFF' : '#000000');

  // ---- landscape design (A01h): scale the whole frame to fit and centre it ----
  if (tree.w > tree.h) {
    const s = Math.min(win.width / tree.w, win.height / tree.h);
    const e = { ...env, s };
    return (
      <View style={[styles.fill, { backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: tree.w * s, height: tree.h * s }}>
          {tree.c?.filter(c => c.n !== 'status bar' && c.n !== 'home indicator').map((c, i) => <Node key={i} n={c} parent={{}} env={e} />)}
        </View>
      </View>
    );
  }

  const colW = Math.min(win.width, MAX_COL);
  const s = colW / DESIGN_W;
  const e = { ...env, s };
  const H = tree.h;
  const kids = tree.c ?? [];
  const header = kids.find(c => c.n === 'header');
  const content = kids.find(c => c.n === 'content');
  const bottom = kids.find(c => c.n === 'footer' || c.n === 'tab bar');
  const sheet = kids.find(c => c.n === 'sheet');
  const scrim = kids.find(c => c.n?.startsWith('scrim'));
  const refs = kids.filter(c => c.t === 'X');
  const floating = kids.filter(c => c !== header && c !== content && c !== bottom && c !== sheet && c !== scrim && c.t !== 'X'
    && c.n !== 'status bar' && c.n !== 'home indicator');

  const topEdge = header ? (header.y ?? STATUS_H) + header.h : STATUS_H;
  const contentGap = content ? Math.max(0, (content.y ?? topEdge) - topEdge) : 0;
  const bottomPad = bottom
    ? bottom.n === 'tab bar'
      ? Math.max(0, insets.bottom - ((bottom.p?.[2] ?? 0) * s) + 4)
      : Math.max(insets.bottom, 12)
    : insets.bottom;

  // pinned parts keep their design height; scrolling content hugs its children
  const flow = (n: DNode): DNode => ({ ...n, x: undefined, y: undefined, z: 'FF', st: 1 });
  const hug = (n: DNode): DNode => ({ ...n, x: undefined, y: undefined, z: 'FH', st: 1, gr: undefined });

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      {refs.map((r, i) => {
        const rid = r.ref ? CODE[r.ref] : undefined;
        return rid && rid !== id ? (
          <View key={'x' + i} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Screen id={rid} interactive={false} />
          </View>
        ) : null;
      })}

      {(header || content || bottom) && (
        <View style={[styles.col, { width: colW, paddingTop: insets.top }]}>
          {header && <Node n={flow(header)} parent={{ lm: 'V' }} env={e} />}
          {content ? (
            content.lm ? (
              <ScrollView
                ref={scrollRef}
                style={styles.fill}
                contentContainerStyle={{ flexGrow: 1, paddingTop: contentGap * s }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                onScroll={ev => { scrollY.current = ev.nativeEvent.contentOffset.y; }}
                scrollEventThrottle={32}
                onContentSizeChange={onContentSize}
              >
                <Node n={hug(content)} parent={{ lm: 'V' }} env={e} />
              </ScrollView>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.fill}
                contentContainerStyle={{ paddingTop: contentGap * s }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={ev => { scrollY.current = ev.nativeEvent.contentOffset.y; }}
                scrollEventThrottle={32}
                onContentSizeChange={onContentSize}
              >
                <Node n={{ ...content, x: undefined, y: undefined }} parent={null} env={e} />
              </ScrollView>
            )
          ) : (
            <View style={styles.fill} />
          )}
          {bottom && <Node n={flow(bottom)} parent={{ lm: 'V' }} env={e} />}
          <View style={{ height: bottomPad }} />
        </View>
      )}

      {floating.length > 0 && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]} pointerEvents="box-none">
          <View style={{ width: colW, flex: 1 }} pointerEvents="box-none">
            {floating.map((f, i) => {
              const y = f.y ?? 0;
              const nearBottom = y + f.h > H - 140;
              const style = nearBottom
                ? { position: 'absolute' as const, left: 0, right: 0, height: f.h * s, bottom: (H - y - f.h) * s + Math.max(0, insets.bottom - 34 * s) }
                : { position: 'absolute' as const, left: 0, right: 0, height: f.h * s, top: (y - STATUS_H) * s + insets.top };
              return (
                <View key={'f' + i} style={style} pointerEvents="box-none">
                  <Node n={{ ...f, y: 0 }} parent={{}} env={e} />
                </View>
              );
            })}
          </View>
        </View>
      )}

      {scrim && (
        <Scrim n={scrim} env={e} />
      )}

      {sheet && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'flex-end' }]} pointerEvents="box-none">
          <View style={{ width: colW, paddingBottom: Math.max(0, insets.bottom - 34 * s) }}>
            <Node n={flow(sheet)} parent={{ lm: 'V' }} env={e} />
          </View>
        </View>
      )}
    </View>
  );
}

function Scrim({ n, env }: { n: DNode; env: Env }) {
  const c = color(fills(n.f)[0]) ?? 'rgba(0,0,0,0.6)';
  return env.interactive
    ? <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c }]} onPress={() => env.act(n, env)} />
    : <View style={[StyleSheet.absoluteFill, { backgroundColor: c }]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  col: { flex: 1, alignSelf: 'center' },
});
