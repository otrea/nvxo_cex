// Market data shown in the design, so screens drawn for BTC can show any coin the user opened.
export type Coin = { name: string; price: number; ch: number; dec: number; vol: string };

export const COINS: Record<string, Coin> = {
  BTC: { name: 'Bitcoin', price: 67412.5, ch: 2.31, dec: 2, vol: '1.24B' },
  ETH: { name: 'Ethereum', price: 3452.18, ch: 1.87, dec: 2, vol: '612.4M' },
  NVXO: { name: 'NVXO Coin', price: 6.254, ch: 11.13, dec: 4, vol: '18.2M' },
  SOL: { name: 'Solana', price: 162.35, ch: -0.94, dec: 2, vol: '204.7M' },
  BNB: { name: 'BNB', price: 598.4, ch: 0.62, dec: 2, vol: '96.1M' },
  XRP: { name: 'XRP', price: 0.5231, ch: -1.42, dec: 4, vol: '88.3M' },
  ADA: { name: 'Cardano', price: 0.4412, ch: 3.05, dec: 4, vol: '41.9M' },
  DOGE: { name: 'Dogecoin', price: 0.1523, ch: 5.21, dec: 4, vol: '57.0M' },
  TRX: { name: 'TRON', price: 0.1234, ch: 0.35, dec: 4, vol: '22.6M' },
  LINK: { name: 'Chainlink', price: 14.52, ch: 1.12, dec: 2, vol: '19.8M' },
  TON: { name: 'Toncoin', price: 5.621, ch: 4.02, dec: 4, vol: '41.3M' },
  ARB: { name: 'Arbitrum', price: 0.812, ch: -1.1, dec: 4, vol: '22.6M' },
  PEPE: { name: 'Pepe', price: 0.00001102, ch: 7.84, dec: 8, vol: '63.4M' },
  AVAX: { name: 'Avalanche', price: 28.4, ch: 0.92, dec: 2, vol: '37.1M' },
};

export const BASE = COINS.BTC;

/** "1,234.50" -> 1234.5 */
export const parseNum = (s: string) => parseFloat(s.replace(/[,\s]/g, ''));
export const decimalsOf = (s: string) => (s.includes('.') ? s.split('.')[1].length : 0);

/** 1234.5, 2 -> "1,234.50" */
export function fmt(v: number, dec: number) {
  const [i, d] = Math.abs(v).toFixed(Math.max(0, dec)).split('.');
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '-' : '') + g + (d ? '.' + d : '');
}

export const pct = (ch: number) => (ch < 0 ? '-' : '+') + Math.abs(ch).toFixed(2) + '%';

/** Fiat rates against EUR for the P2P currency picker. */
export const FIAT: Record<string, number> = { EUR: 1, CZK: 24.3, PLN: 4.27, HUF: 395, RON: 4.97 };

export const COUNTRIES: Record<string, { iso: string; dial: string }> = {
  Czechia: { iso: 'CZ', dial: '+420' },
  Slovakia: { iso: 'SK', dial: '+421' },
  Germany: { iso: 'DE', dial: '+49' },
  Austria: { iso: 'AT', dial: '+43' },
  Poland: { iso: 'PL', dial: '+48' },
  Lithuania: { iso: 'LT', dial: '+370' },
};
