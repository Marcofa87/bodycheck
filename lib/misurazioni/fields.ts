import type { MetricaKey } from "@/lib/supabase/types";

export type Unita = "kg" | "%" | "cm";
export type SezioneId = "chiave" | "braccia" | "gambe";

/**
 * Definizione di una metrica: solo dati. Le etichette (`label`, `short`) vivono nei
 * messaggi tradotti sotto `campi.<key>` e si ottengono con `useTranslations("campi")`.
 */
export interface CampoMetrica {
  key: MetricaKey;
  unita: Unita;
  sezione: SezioneId;
  /** Range plausibile usato dalla validazione. */
  min: number;
  max: number;
}

/** Le etichette delle sezioni sono nei messaggi tradotti sotto `sezioni.<id>`. */
export const SEZIONI: SezioneId[] = ["chiave", "braccia", "gambe"];

export const CAMPI: CampoMetrica[] = [
  // Sezione 1 — Statistiche chiave
  { key: "peso_kg", unita: "kg", sezione: "chiave", min: 20, max: 300 },
  { key: "massa_grassa_kg", unita: "kg", sezione: "chiave", min: 0, max: 200 },
  { key: "massa_magra_kg", unita: "kg", sezione: "chiave", min: 0, max: 200 },
  { key: "grasso_corporeo_percentuale", unita: "%", sezione: "chiave", min: 0, max: 100 },
  { key: "collo_cm", unita: "cm", sezione: "chiave", min: 20, max: 80 },
  { key: "torace_superiore_cm", unita: "cm", sezione: "chiave", min: 40, max: 200 },
  { key: "petto_cm", unita: "cm", sezione: "chiave", min: 40, max: 200 },
  { key: "vita_cm", unita: "cm", sezione: "chiave", min: 40, max: 200 },

  // Sezione 2 — Braccia
  { key: "braccio_sinistro_cm", unita: "cm", sezione: "braccia", min: 10, max: 80 },
  { key: "braccio_destro_cm", unita: "cm", sezione: "braccia", min: 10, max: 80 },

  // Sezione 3 — Gambe
  { key: "fianchi_cm", unita: "cm", sezione: "gambe", min: 50, max: 200 },
  { key: "vita_fianchi_cm", unita: "cm", sezione: "gambe", min: 40, max: 200 },
  { key: "coscia_superiore_sinistra_cm", unita: "cm", sezione: "gambe", min: 20, max: 120 },
  { key: "coscia_superiore_destra_cm", unita: "cm", sezione: "gambe", min: 20, max: 120 },
  { key: "coscia_inferiore_sinistra_cm", unita: "cm", sezione: "gambe", min: 20, max: 120 },
  { key: "coscia_inferiore_destra_cm", unita: "cm", sezione: "gambe", min: 20, max: 120 },
  { key: "polpaccio_sinistro_cm", unita: "cm", sezione: "gambe", min: 15, max: 80 },
  { key: "polpaccio_destro_cm", unita: "cm", sezione: "gambe", min: 15, max: 80 },
];

export const CAMPI_PER_SEZIONE: Record<SezioneId, CampoMetrica[]> = {
  chiave: CAMPI.filter((c) => c.sezione === "chiave"),
  braccia: CAMPI.filter((c) => c.sezione === "braccia"),
  gambe: CAMPI.filter((c) => c.sezione === "gambe"),
};

const CAMPI_MAP = new Map(CAMPI.map((c) => [c.key, c]));

export function getCampo(key: MetricaKey): CampoMetrica {
  const campo = CAMPI_MAP.get(key);
  if (!campo) throw new Error(`Campo sconosciuto: ${key}`);
  return campo;
}

/** Le 4 metriche mostrate nelle card della dashboard e nella tabella storico. */
export const METRICHE_PRINCIPALI: MetricaKey[] = [
  "peso_kg",
  "massa_magra_kg",
  "massa_grassa_kg",
  "grasso_corporeo_percentuale",
];

/** Metrica derivata (non salvata nel DB) disponibile nei grafici. */
export const METRICA_DERIVATA_VITA_FIANCHI = "rapporto_vita_fianchi" as const;
export type MetricaGrafico = MetricaKey | typeof METRICA_DERIVATA_VITA_FIANCHI;
