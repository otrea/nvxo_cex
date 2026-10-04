// App-wide demo state that outlives a single screen: the coin being viewed, favourites,
// P2P filters, the chosen phone country and a picked support attachment.
import { useSyncExternalStore } from 'react';

export type P2PFilter = { cur: string; amount: number | null; method: string | null };
export type Attachment = { name: string; size: number | null };
export type AppState = {
  coin: string;
  fav: string[];
  p2p: P2PFilter;
  /** values being edited in the P2P filter sheets, committed by Apply */
  pend: { amount: number | null; method: string | null };
  country: string;
  att: Attachment | null;
};

let state: AppState = {
  coin: 'BTC',
  fav: ['BTC', 'ETH', 'NVXO'],
  p2p: { cur: 'EUR', amount: null, method: null },
  pend: { amount: null, method: null },
  country: 'Czechia',
  att: null,
};
const subs = new Set<() => void>();

export const getState = () => state;
export function setState(fn: (s: AppState) => Partial<AppState>) {
  state = { ...state, ...fn(state) };
  subs.forEach(f => f());
}
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => { subs.delete(f); };
};
export const useAppState = () => useSyncExternalStore(subscribe, getState, getState);

export const toggleFav = (sym: string) => {
  const on = state.fav.includes(sym);
  setState(s => ({ fav: on ? s.fav.filter(x => x !== sym) : [...s.fav, sym] }));
  return !on;
};
