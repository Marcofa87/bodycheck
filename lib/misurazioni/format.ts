import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

import type { Unita } from "./fields";

const numberFormat = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const numberFormat2 = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumero(value: number | null | undefined, decimali: 1 | 2 = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return (decimali === 2 ? numberFormat2 : numberFormat).format(value);
}

export function formatValore(value: number | null | undefined, unita: Unita): string {
  if (value === null || value === undefined) return "—";
  return `${formatNumero(value)} ${unita}`;
}

/** Variazione con segno esplicito, es. "+0,4 kg" / "−1,2 %". */
export function formatVariazione(delta: number, unita: Unita): string {
  const segno = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${segno}${formatNumero(Math.abs(delta))} ${unita}`;
}

export function formatData(iso: string, pattern = "d MMM yyyy"): string {
  return format(parseISO(iso), pattern, { locale: it });
}

export function formatDataLunga(iso: string): string {
  return format(parseISO(iso), "EEEE d MMMM yyyy", { locale: it });
}
