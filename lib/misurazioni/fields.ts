import type { MetricaKey } from "@/lib/supabase/types";

export type Unita = "kg" | "%" | "cm";
export type SezioneId = "chiave" | "braccia" | "gambe";

export interface CampoMetrica {
  key: MetricaKey;
  label: string;
  /** Etichetta corta per tabelle e grafici. */
  short: string;
  unita: Unita;
  sezione: SezioneId;
  /** Range plausibile usato dalla validazione. */
  min: number;
  max: number;
}

export interface Sezione {
  id: SezioneId;
  label: string;
  descrizione: string;
}

export const SEZIONI: Sezione[] = [
  {
    id: "chiave",
    label: "Statistiche chiave",
    descrizione: "Peso, composizione corporea e circonferenze del tronco.",
  },
  {
    id: "braccia",
    label: "Braccia",
    descrizione: "Circonferenza delle braccia.",
  },
  { id: "gambe", label: "Gambe", descrizione: "Fianchi, cosce e polpacci." },
];

export const CAMPI: CampoMetrica[] = [
  // Sezione 1 — Statistiche chiave
  {
    key: "peso_kg",
    label: "Peso",
    short: "Peso",
    unita: "kg",
    sezione: "chiave",
    min: 20,
    max: 300,
  },
  {
    key: "massa_grassa_kg",
    label: "Massa grassa",
    short: "M. grassa",
    unita: "kg",
    sezione: "chiave",
    min: 0,
    max: 200,
  },
  {
    key: "massa_magra_kg",
    label: "Massa magra",
    short: "M. magra",
    unita: "kg",
    sezione: "chiave",
    min: 0,
    max: 200,
  },
  {
    key: "grasso_corporeo_percentuale",
    label: "Grasso corporeo",
    short: "Grasso %",
    unita: "%",
    sezione: "chiave",
    min: 0,
    max: 100,
  },
  {
    key: "collo_cm",
    label: "Collo",
    short: "Collo",
    unita: "cm",
    sezione: "chiave",
    min: 20,
    max: 80,
  },
  {
    key: "torace_superiore_cm",
    label: "Parte superiore torace",
    short: "Torace sup.",
    unita: "cm",
    sezione: "chiave",
    min: 40,
    max: 200,
  },
  {
    key: "petto_cm",
    label: "Petto",
    short: "Petto",
    unita: "cm",
    sezione: "chiave",
    min: 40,
    max: 200,
  },
  {
    key: "vita_cm",
    label: "Vita",
    short: "Vita",
    unita: "cm",
    sezione: "chiave",
    min: 40,
    max: 200,
  },

  // Sezione 2 — Braccia
  {
    key: "braccio_sinistro_cm",
    label: "Braccio sinistro",
    short: "Braccio sx",
    unita: "cm",
    sezione: "braccia",
    min: 10,
    max: 80,
  },
  {
    key: "braccio_destro_cm",
    label: "Braccio destro",
    short: "Braccio dx",
    unita: "cm",
    sezione: "braccia",
    min: 10,
    max: 80,
  },

  // Sezione 3 — Gambe
  {
    key: "fianchi_cm",
    label: "Fianchi",
    short: "Fianchi",
    unita: "cm",
    sezione: "gambe",
    min: 50,
    max: 200,
  },
  {
    key: "vita_fianchi_cm",
    label: "Vita-fianchi",
    short: "Vita-fianchi",
    unita: "cm",
    sezione: "gambe",
    min: 40,
    max: 200,
  },
  {
    key: "coscia_superiore_sinistra_cm",
    label: "Coscia superiore sinistra",
    short: "Coscia sup. sx",
    unita: "cm",
    sezione: "gambe",
    min: 20,
    max: 120,
  },
  {
    key: "coscia_superiore_destra_cm",
    label: "Coscia superiore destra",
    short: "Coscia sup. dx",
    unita: "cm",
    sezione: "gambe",
    min: 20,
    max: 120,
  },
  {
    key: "coscia_inferiore_sinistra_cm",
    label: "Coscia inferiore sinistra",
    short: "Coscia inf. sx",
    unita: "cm",
    sezione: "gambe",
    min: 20,
    max: 120,
  },
  {
    key: "coscia_inferiore_destra_cm",
    label: "Coscia inferiore destra",
    short: "Coscia inf. dx",
    unita: "cm",
    sezione: "gambe",
    min: 20,
    max: 120,
  },
  {
    key: "polpaccio_sinistro_cm",
    label: "Polpaccio sinistro",
    short: "Polpaccio sx",
    unita: "cm",
    sezione: "gambe",
    min: 15,
    max: 80,
  },
  {
    key: "polpaccio_destro_cm",
    label: "Polpaccio destro",
    short: "Polpaccio dx",
    unita: "cm",
    sezione: "gambe",
    min: 15,
    max: 80,
  },
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
