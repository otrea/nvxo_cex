// Demo persona per language. The Figma design shows a Czech user (Jan Novák, Prague); the app swaps in
// an international one — Alex Morgan (Berlin) in English, Алексей Смирнов (Riga) in Russian — together with
// e-mail, phone, address, IBAN, bank and the P2P counterparties. Applied to the final text on screen
// (after translation), so Russian rules may match Russian wording.
import type { Lang } from './i18n';

/** [from, to] substring replacements, longest first; `exact` rules only replace a whole text. */
type Rules = { sub: [string, string][]; exact: [string, string][]; byScreen: Record<string, [string, string][]> };

const EN: Rules = {
  sub: [
    ['Jan Novák', 'Alex Morgan'],
    ['jan.novak@newmail.cz', 'alex.morgan@newmail.com'],
    ['jan.novak@email.cz', 'alex.morgan@mail.com'],
    ['jan.n•••@email.cz', 'alex.m•••@mail.com'],
    ['pe***@email.cz', 'em***@mail.com'],
    ['ma***@email.cz', 'ma***@mail.com'],
    ['CZ +420', 'DE +49'],
    ['+420 777 123 456', '+49 151 2345 6789'],
    ['+420 777 •••456', '+49 151 •••6789'],
    ['Vinohradská 12, 120 00 Praha 2', 'Torstraße 12, 10119 Berlin'],
    ['Prague, CZ', 'Berlin, DE'],
    ['Brno, CZ', 'Hamburg, DE'],
    ['CZ55 0800 0000 0012 3456 1234', 'DE89 3704 0044 0532 0112 34'],
    ['CZ55 0800 •••• •••• 1234', 'DE89 3704 •••• •••• 1234'],
    ['CZ55 0800 •••• 1234', 'DE89 3704 •••• 1234'],
    ['CZ55 •••• 1234', 'DE89 •••• 1234'],
    ['Česká spořitelna', 'Deutsche Bank'],
    ['GIBACZPX', 'DEUTDEBBXXX'],
    ['a.k***@**.cz', 'a.k***@**.com'],
    ['pe***@**.cz', 'em***@**.com'],
    ['Petra Svobodová', 'Emma Schmidt'],
    ['Petra S.', 'Emma S.'],
    ['Petra has', 'Emma has'],
    ['CZ98 3456 0000 0098 7654 3210', 'DE44 5001 0517 5407 3249 31'],
    ['Tomáš Kovář', 'Tom Walker'],
    ['Tomáš K.', 'Tom W.'],
    ['Tomáš has', 'Tom has'],
    ['CZ65 0800 0000 1920 0014 5399', 'DE21 1001 0010 0912 3456 78'],
    ['CryptoDesk CZ', 'CryptoDesk EU'],
    ['Hi Jan,', 'Hi Alex,'],
    ['Test Project Jan', 'Test Project Alex'],
  ],
  exact: [
    ['JN', 'AM'],
    ['Jan', 'Alex'],
    ['Novák', 'Morgan'],
    ['777 123 456', '151 2345 6789'],
    ['Vinohradská 12', 'Torstraße 12'],
    ['Praha 2', 'Berlin'],
    ['120 00', '10119'],
    ['30 Sep 2026, 09:12 · Prague', '30 Sep 2026, 09:12 · Berlin'],
  ],
  byScreen: { Q02: [['Czechia', 'Germany']] },
};

const RU: Rules = {
  sub: [
    ['Jan Novák', 'Алексей Смирнов'],
    ['jan.novak@newmail.cz', 'aleksei.smirnov@newmail.com'],
    ['jan.novak@email.cz', 'aleksei.smirnov@mail.com'],
    ['jan.n•••@email.cz', 'aleksei.s•••@mail.com'],
    ['pe***@email.cz', 'ol***@mail.com'],
    ['ma***@email.cz', 'ma***@mail.com'],
    ['CZ +420', 'LV +371'],
    ['+420 777 123 456', '+371 2012 3456'],
    ['+420 777 •••456', '+371 20•••456'],
    ['Vinohradská 12, 120 00 Praha 2', 'ул. Бривибас 12, LV-1010 Рига'],
    ['Прага, CZ', 'Рига, LV'],
    ['Брно, CZ', 'Юрмала, LV'],
    ['CZ55 0800 0000 0012 3456 1234', 'LV80 HABA 0551 0012 3412 34'],
    ['CZ55 0800 •••• •••• 1234', 'LV80 HABA •••• •••• 1234'],
    ['CZ55 0800 •••• 1234', 'LV80 HABA •••• 1234'],
    ['CZ55 •••• 1234', 'LV80 •••• 1234'],
    ['Česká spořitelna', 'Swedbank'],
    ['GIBACZPX', 'HABALV22'],
    ['a.k***@**.cz', 'a.k***@**.com'],
    ['pe***@**.cz', 'ol***@**.com'],
    ['Petra Svobodová', 'Ольга Соколова'],
    ['Petra S.', 'Ольга С.'],
    ['CZ98 3456 0000 0098 7654 3210', 'LV97 HABA 0012 3456 7890 1'],
    ['Tomáš Kovář', 'Дмитрий Ковалёв'],
    ['Tomáš K.', 'Дмитрий К.'],
    ['CZ65 0800 0000 1920 0014 5399', 'LV80 BANK 0000 4351 9500 1'],
    ['CryptoDesk CZ', 'CryptoDesk EU'],
    ['Martin K.', 'Максим К.'],
    ['Lukas W.', 'Игорь В.'],
  ],
  exact: [
    ['JN', 'АС'],
    ['Jan', 'Алексей'],
    ['Novák', 'Смирнов'],
    ['777 123 456', '2012 3456'],
    ['Vinohradská 12', 'ул. Бривибас 12'],
    ['Praha 2', 'Рига'],
    ['120 00', 'LV-1010'],
  ],
  byScreen: { Q02: [['Чехия', 'Латвия'], ['Czechia', 'Латвия']] },
};

const RULES: Record<Lang, Rules> = { en: EN, ru: RU };

export function persona(t: string, lang: Lang, code?: string): string {
  if (!t) return t;
  const r = RULES[lang];
  for (const [a, b] of r.exact) if (t === a) return b;
  for (const [a, b] of (code && r.byScreen[code.replace(/L$/, '')]) || []) if (t === a) return b;
  let out = t;
  for (const [a, b] of r.sub) if (out.includes(a)) out = out.split(a).join(b);
  return out;
}
