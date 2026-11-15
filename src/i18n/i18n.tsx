// Language: English (the design's own text) or Russian. Text is translated at render time from a
// dictionary keyed by the exact English string, so all screen logic keeps working on the English design.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import RU from './ru.json';

export type Lang = 'en' | 'ru';
type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const KEY = 'nvxo-cex.lang';
const LangCtx = createContext<Ctx>({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => {
        if (v === 'en' || v === 'ru') setLangState(v);
        else if (!v) {
          // first run: follow a Russian phone, otherwise English
          let loc = '';
          try { loc = Intl.DateTimeFormat().resolvedOptions().locale || ''; } catch { /* ignore */ }
          if (/^ru\b/i.test(loc)) setLangState('ru');
        }
      })
      .catch(() => {});
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }, []);
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

export const LANG_LABEL: Record<Lang, string> = { en: 'English', ru: 'Русский' };

const DICT = RU as Record<string, string>;
const MONTHS: Record<string, string> = {
  Jan: 'янв.', Feb: 'февр.', Mar: 'мар.', Apr: 'апр.', May: 'мая', Jun: 'июн.',
  Jul: 'июл.', Aug: 'авг.', Sep: 'сент.', Oct: 'окт.', Nov: 'нояб.', Dec: 'дек.',
};
const MONTHS_LONG: Record<string, string> = {
  January: 'Январь', February: 'Февраль', March: 'Март', April: 'Апрель', May: 'Май', June: 'Июнь',
  July: 'Июль', August: 'Август', September: 'Сентябрь', October: 'Октябрь', November: 'Ноябрь', December: 'Декабрь',
};

/** Rules for text the app builds at run time (dates, volumes, "A · B" labels made of known parts). */
function rules(t: string): string | undefined {
  let m = /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/.exec(t);
  if (m) return `${MONTHS_LONG[m[1]]} ${m[2]}`;
  m = /^Vol (.+)$/.exec(t);
  if (m) return `Объём ${m[1]}`;
  m = /^Price set to (.+)$/.exec(t);
  if (m) return `Цена: ${m[1]}`;
  m = /^Nothing matches “(.+)”\.$/.exec(t);
  if (m) return `По запросу «${m[1]}» ничего не найдено.`;
  if (/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(t)) {
    const parts = t.split(' · ');
    return parts.map(p => DICT[p] ?? p.replace(/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (_, d, mo) => `${d} ${MONTHS[mo]}`)).join(' · ');
  }
  if (t.includes(' · ')) {
    const parts = t.split(' · ');
    if (parts.some(p => DICT[p])) return parts.map(p => DICT[p] ?? p).join(' · ');
  }
  return undefined;
}

export function tr(t: string, lang: Lang): string {
  if (lang === 'en' || !t || !/[A-Za-z]/.test(t)) return t;
  return DICT[t] ?? rules(t) ?? t;
}

export const hasCyrillic = (t: string) => /[Ѐ-ӿ]/.test(t);
