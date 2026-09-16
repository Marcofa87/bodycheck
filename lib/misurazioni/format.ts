import { format, parseISO } from "date-fns";
import { useLocale } from "next-intl";

import { LOCALE_INFO, type Locale } from "@/i18n/config";

import type { Unita } from "./fields";

export interface FormatterMisurazioni {
  locale: Locale;
  /** Separatore decimale della lingua ("," in italiano, "." in inglese). */
  separatoreDecimale: string;
  /** Numero con al massimo 1 o 2 decimali; "—" se assente. */
  numero(value: number | null | undefined, decimali?: 1 | 2): string;
  /** Numero seguito dall'unità, es. "72,5 kg". */
  valore(value: number | null | undefined, unita: Unita): string;
  /** Variazione con segno esplicito, es. "+0,4 kg" / "−1,2 %". */
  variazione(delta: number, unita: Unita): string;
  data(iso: string, pattern?: string): string;
  dataLunga(iso: string): string;
  /** Numero nel formato atteso dagli input del form (separatore decimale della lingua, nessun raggruppamento). */
  perInput(value: number): string;
}

function separatoreDecimale(intl: string): string {
  return (
    new Intl.NumberFormat(intl).formatToParts(1.1).find((p) => p.type === "decimal")?.value ?? "."
  );
}

const cache = new Map<Locale, FormatterMisurazioni>();

/** Formatter per numeri e date coerente con la lingua dell'interfaccia. Istanze memorizzate per lingua. */
export function creaFormatter(locale: Locale): FormatterMisurazioni {
  const esistente = cache.get(locale);
  if (esistente) return esistente;

  const info = LOCALE_INFO[locale];
  const unDecimale = new Intl.NumberFormat(info.intl, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  const dueDecimali = new Intl.NumberFormat(info.intl, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const separatore = separatoreDecimale(info.intl);

  const numero: FormatterMisurazioni["numero"] = (value, decimali = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return (decimali === 2 ? dueDecimali : unDecimale).format(value);
  };

  const formatter: FormatterMisurazioni = {
    locale,
    separatoreDecimale: separatore,
    numero,
    valore(value, unita) {
      if (value === null || value === undefined) return "—";
      return `${numero(value)} ${unita}`;
    },
    variazione(delta, unita) {
      const segno = delta > 0 ? "+" : delta < 0 ? "−" : "";
      return `${segno}${numero(Math.abs(delta))} ${unita}`;
    },
    data(iso, pattern = "d MMM yyyy") {
      return format(parseISO(iso), pattern, { locale: info.dateFns });
    },
    dataLunga(iso) {
      return format(parseISO(iso), "EEEE d MMMM yyyy", { locale: info.dateFns });
    },
    perInput(value) {
      return String(value).replace(".", separatore);
    },
  };

  cache.set(locale, formatter);
  return formatter;
}

/** Formatter per la lingua corrente. Utilizzabile sia nei Server Components (sincroni) che nei Client Components. */
export function useFormatMisurazioni(): FormatterMisurazioni {
  return creaFormatter(useLocale());
}
