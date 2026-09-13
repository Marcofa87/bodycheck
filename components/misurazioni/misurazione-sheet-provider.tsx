"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Misurazione } from "@/lib/supabase/types";

import { MisurazioneForm } from "./misurazione-form";

interface MisurazioneSheetContextValue {
  apriNuova: () => void;
  apriModifica: (misurazione: Misurazione) => void;
  chiudi: () => void;
}

const MisurazioneSheetContext = createContext<MisurazioneSheetContextValue | null>(null);

/**
 * Rende disponibile in tutta l'area /dashboard il pannello laterale con il form,
 * così il bottone "+ Nuova misurazione" e l'azione "Modifica" possono aprirlo da ovunque.
 */
export function MisurazioneSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [misurazione, setMisurazione] = useState<Misurazione | null>(null);

  const apriNuova = useCallback(() => {
    setMisurazione(null);
    setOpen(true);
  }, []);

  const apriModifica = useCallback((m: Misurazione) => {
    setMisurazione(m);
    setOpen(true);
  }, []);

  const chiudi = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ apriNuova, apriModifica, chiudi }), [apriNuova, apriModifica, chiudi]);

  return (
    <MisurazioneSheetContext.Provider value={value}>
      {children}

      <Sheet open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <SheetContent
          side="right"
          className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        >
          <SheetHeader className="border-b pr-12">
            <SheetTitle>{misurazione ? "Modifica misurazione" : "Nuova misurazione"}</SheetTitle>
            <SheetDescription>
              {misurazione
                ? "Aggiorna i valori e salva le modifiche."
                : "Compila le tre sezioni: solo peso e data sono obbligatori."}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 pt-4">
            {/* La key rimonta il form al cambio di misurazione, resettando i valori */}
            <MisurazioneForm
              key={misurazione?.id ?? "nuova"}
              misurazione={misurazione}
              onSuccess={chiudi}
            />
          </div>
        </SheetContent>
      </Sheet>
    </MisurazioneSheetContext.Provider>
  );
}

export function useMisurazioneSheet() {
  const ctx = useContext(MisurazioneSheetContext);
  if (!ctx) {
    throw new Error("useMisurazioneSheet deve essere usato dentro MisurazioneSheetProvider");
  }
  return ctx;
}
