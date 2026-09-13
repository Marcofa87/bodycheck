/**
 * Tipi del database Supabase.
 *
 * Scritti a mano seguendo il formato generato dalla CLI Supabase, così da poterli
 * rigenerare in futuro con:
 *
 *   npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      misurazioni: {
        Row: {
          id: string;
          user_id: string;
          data_misurazione: string;
          peso_kg: number | null;
          massa_grassa_kg: number | null;
          massa_magra_kg: number | null;
          grasso_corporeo_percentuale: number | null;
          collo_cm: number | null;
          torace_superiore_cm: number | null;
          petto_cm: number | null;
          vita_cm: number | null;
          braccio_sinistro_cm: number | null;
          braccio_destro_cm: number | null;
          fianchi_cm: number | null;
          vita_fianchi_cm: number | null;
          coscia_superiore_sinistra_cm: number | null;
          coscia_superiore_destra_cm: number | null;
          coscia_inferiore_sinistra_cm: number | null;
          coscia_inferiore_destra_cm: number | null;
          polpaccio_sinistro_cm: number | null;
          polpaccio_destro_cm: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          data_misurazione?: string;
          peso_kg?: number | null;
          massa_grassa_kg?: number | null;
          massa_magra_kg?: number | null;
          grasso_corporeo_percentuale?: number | null;
          collo_cm?: number | null;
          torace_superiore_cm?: number | null;
          petto_cm?: number | null;
          vita_cm?: number | null;
          braccio_sinistro_cm?: number | null;
          braccio_destro_cm?: number | null;
          fianchi_cm?: number | null;
          vita_fianchi_cm?: number | null;
          coscia_superiore_sinistra_cm?: number | null;
          coscia_superiore_destra_cm?: number | null;
          coscia_inferiore_sinistra_cm?: number | null;
          coscia_inferiore_destra_cm?: number | null;
          polpaccio_sinistro_cm?: number | null;
          polpaccio_destro_cm?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          data_misurazione?: string;
          peso_kg?: number | null;
          massa_grassa_kg?: number | null;
          massa_magra_kg?: number | null;
          grasso_corporeo_percentuale?: number | null;
          collo_cm?: number | null;
          torace_superiore_cm?: number | null;
          petto_cm?: number | null;
          vita_cm?: number | null;
          braccio_sinistro_cm?: number | null;
          braccio_destro_cm?: number | null;
          fianchi_cm?: number | null;
          vita_fianchi_cm?: number | null;
          coscia_superiore_sinistra_cm?: number | null;
          coscia_superiore_destra_cm?: number | null;
          coscia_inferiore_sinistra_cm?: number | null;
          coscia_inferiore_destra_cm?: number | null;
          polpaccio_sinistro_cm?: number | null;
          polpaccio_destro_cm?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Misurazione = Database["public"]["Tables"]["misurazioni"]["Row"];
export type MisurazioneInsert = Database["public"]["Tables"]["misurazioni"]["Insert"];
export type MisurazioneUpdate = Database["public"]["Tables"]["misurazioni"]["Update"];

/** Colonne numeriche della misurazione (tutte le metriche tracciabili). */
export type MetricaKey = Exclude<
  keyof Misurazione,
  "id" | "user_id" | "data_misurazione" | "note" | "created_at"
>;
