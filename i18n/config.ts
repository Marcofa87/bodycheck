import type { Locale as DateFnsLocale } from "date-fns";
import { enGB, it } from "date-fns/locale";

/**
 * Lingue supportate dall'app. Per aggiungerne una:
 * 1. aggiungi il codice qui (TypeScript segnalerà i mapping mancanti in LOCALE_INFO);
 * 2. crea `messages/<codice>.json` con le stesse chiavi di `messages/it.json`.
 */
export const LOCALES = ["en", "it"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie in cui viene salvata la lingua scelta dall'utente. */
export const LOCALE_COOKIE = "bodytrack_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface LocaleInfo {
  /** Nome della lingua nella lingua stessa, mostrato nel selettore. */
  label: string;
  /** Icona circolare della bandiera in `public/`. */
  bandiera: string;
  /** Tag BCP 47 usato da `Intl` per numeri e date. */
  intl: string;
  dateFns: DateFnsLocale;
  /** Separatore di campo del CSV (Excel in italiano usa `;`). */
  separatoreCsv: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: {
    label: "English",
    bandiera: "/icons8-circolare-inglese-24.png",
    intl: "en-GB",
    dateFns: enGB,
    separatoreCsv: ",",
  },
  it: {
    label: "Italiano",
    bandiera: "/icons8-circolare-italia-48.png",
    intl: "it-IT",
    dateFns: it,
    separatoreCsv: ";",
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Sceglie la lingua migliore a partire dall'header `Accept-Language`
 * (es. "it-IT,it;q=0.9,en;q=0.8"). Restituisce `null` se nessuna è supportata.
 */
export function negoziaLocale(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) return null;

  const preferenze = acceptLanguage
    .split(",")
    .map((parte, indice) => {
      const [tag, ...params] = parte.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      const peso = q === undefined ? 1 : Number(q);
      return { tag: tag.toLowerCase(), peso: Number.isNaN(peso) ? 0 : peso, indice };
    })
    .filter((p) => p.tag && p.peso > 0)
    .sort((a, b) => b.peso - a.peso || a.indice - b.indice);

  for (const { tag } of preferenze) {
    const lingua = tag.split("-")[0];
    if (isLocale(lingua)) return lingua;
  }
  return null;
}
