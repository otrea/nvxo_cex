// Composes one design screen for a real device: the Figma status bar and home indicator
// give way to the device's safe areas, the header and footer/tab bar are pinned,
// the content scrolls, and sheets sit on top of the screen they reference.
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { CODE, DARK, DNode, HOME_ID, toDark, treeFor } from '@/design/data';
import { modeLabel, useTheme } from '@/theme/theme';
import { color, fills } from './paint';
import { Env, Node } from './Node';

const DESIGN_W = 393;
const MAX_COL = 440;
const STATUS_H = 50;

export const enc = (id: string) => id.replace(':', '_');
export const dec = (id: string) => id.replace('_', ':');

const isSheetTree = (t?: DNode) => !!t?.c?.some(c => c.n === 'sheet');

export function go(id: string, how: 'push' | 'replace' | 'tab' = 'push') {
  const dark = toDark(id);
  if (!DARK[dark]) return;
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

export function Screen({ id, interactive = true }: Props) {
  const { light, mode, setMode } = useTheme();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const landscape = win.width > win.height;

  // landscape variant of a screen (A01 -> A01h) when the phone is turned
  const meta = DARK[id];
  const useId = (landscape && meta && CODE[meta.code + 'h']) || id;
  const tree = treeFor(useId, light);

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
        if (pd === 'toast') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); toast(toastText(n)); return; }
        if (pd === 'self' && !n.to) { Haptics.selectionAsync().catch(() => {}); return; }
        if (n.to === 'back' || pd === 'back') { back(); return; }
        const target = n.to ?? (pd && CODE[pd]) ?? undefined;
        if (!target) return;
        const tabLike = e.inTabBar || /^(tab|seg) /.test(name);
        go(target, tabLike ? 'tab' : 'push');
      },
    };
  }, [meta, interactive, mode, setMode, toast, tree]);

  if (!tree) return <View style={{ flex: 1, backgroundColor: light ? '#FFFFFF' : '#000000' }} />;

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
                style={styles.fill}
                contentContainerStyle={{ flexGrow: 1, paddingTop: contentGap * s }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Node n={hug(content)} parent={{ lm: 'V' }} env={e} />
              </ScrollView>
            ) : (
              <ScrollView style={styles.fill} contentContainerStyle={{ paddingTop: contentGap * s }} showsVerticalScrollIndicator={false}>
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
