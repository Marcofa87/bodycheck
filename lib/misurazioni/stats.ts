import { differenceInCalendarDays, parseISO } from "date-fns";

import type { MetricaKey, Misurazione } from "@/lib/supabase/types";

import { METRICA_DERIVATA_VITA_FIANCHI, type MetricaGrafico } from "./fields";

export interface PuntoSerie {
  data: string;
  valore: number;
}

export interface UltimoValore {
  valore: number;
  data: string;
  /** Differenza rispetto alla misurazione precedente che aveva questo valore. */
  variazione: number | null;
}

/** Rapporto vita/fianchi calcolato al volo (non salvato nel DB). */
export function rapportoVitaFianchi(m: Misurazione): number | null {
  if (m.vita_cm === null || m.fianchi_cm === null || m.fianchi_cm === 0) return null;
  return Math.round((m.vita_cm / m.fianchi_cm) * 100) / 100;
}

export function valoreMetrica(m: Misurazione, metrica: MetricaGrafico): number | null {
  if (metrica === METRICA_DERIVATA_VITA_FIANCHI) return rapportoVitaFianchi(m);
  return m[metrica];
}

/**
 * Ultimo valore disponibile per una metrica e variazione rispetto al precedente.
 * `misurazioni` deve essere ordinato per data decrescente.
 */
export function ultimoValore(misurazioni: Misurazione[], key: MetricaKey): UltimoValore | null {
  const conValore = misurazioni.filter((m) => m[key] !== null);
  const ultimo = conValore[0];
  if (!ultimo) return null;

  const precedente = conValore[1];
  const valore = ultimo[key] as number;
  return {
    valore,
    data: ultimo.data_misurazione,
    variazione: precedente ? valore - (precedente[key] as number) : null,
  };
}

/**
 * Serie temporale (ordinata per data crescente) di una metrica,
 * opzionalmente limitata agli ultimi `giorni`.
 */
export function serieMetrica(
  misurazioni: Misurazione[],
  metrica: MetricaGrafico,
  giorni: number | null,
): PuntoSerie[] {
  const oggi = new Date();
  return misurazioni
    .filter((m) => {
      if (giorni === null) return true;
      return differenceInCalendarDays(oggi, parseISO(m.data_misurazione)) <= giorni;
    })
    .map((m) => ({ data: m.data_misurazione, valore: valoreMetrica(m, metrica) }))
    .filter((p): p is PuntoSerie => p.valore !== null)
    .sort((a, b) => a.data.localeCompare(b.data));
}

export interface RiepilogoSerie {
  variazione: number;
  media: number;
  minimo: number;
  massimo: number;
  primo: PuntoSerie;
  ultimo: PuntoSerie;
  conteggio: number;
}

export function riepilogoSerie(serie: PuntoSerie[]): RiepilogoSerie | null {
  if (serie.length === 0) return null;
  const valori = serie.map((p) => p.valore);
  const somma = valori.reduce((acc, v) => acc + v, 0);
  const primo = serie[0];
  const ultimo = serie[serie.length - 1];
  return {
    variazione: ultimo.valore - primo.valore,
    media: somma / valori.length,
    minimo: Math.min(...valori),
    massimo: Math.max(...valori),
    primo,
    ultimo,
    conteggio: serie.length,
  };
}
