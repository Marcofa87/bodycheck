"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CAMPI_PER_SEZIONE, SEZIONI } from "@/lib/misurazioni/fields";
import { useFormatMisurazioni } from "@/lib/misurazioni/format";
import { rapportoVitaFianchi } from "@/lib/misurazioni/stats";
import type { Misurazione } from "@/lib/supabase/types";

interface MisurazioneDettaglioDialogProps {
  misurazione: Misurazione | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModifica: (m: Misurazione) => void;
  onElimina: (m: Misurazione) => void;
}

export function MisurazioneDettaglioDialog({
  misurazione,
  open,
  onOpenChange,
  onModifica,
  onElimina,
}: MisurazioneDettaglioDialogProps) {
  const t = useTranslations();
  const formatter = useFormatMisurazioni();
  const rapporto = misurazione ? rapportoVitaFianchi(misurazione) : null;
  // Focus iniziale sul titolo: altrimenti andrebbe sul primo bottone ("Elimina")
  // e il dialog si aprirebbe già scrollato in fondo.
  const titoloRef = useRef<HTMLHeadingElement>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent
        className="max-h-[90svh] overflow-y-auto sm:max-w-lg"
        initialFocus={titoloRef}
      >
        <DialogHeader>
          <DialogTitle ref={titoloRef} tabIndex={-1} className="outline-none">
            {t("dettaglio.titolo")}
          </DialogTitle>
          <DialogDescription>
            {misurazione ? formatter.dataLunga(misurazione.data_misurazione) : ""}
          </DialogDescription>
        </DialogHeader>

        {misurazione && (
          <div className="space-y-5">
            {SEZIONI.map((sezione) => {
              const campi = CAMPI_PER_SEZIONE[sezione];
              const compilati = campi.filter((c) => misurazione[c.key] !== null);
              return (
                <section key={sezione}>
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t(`sezioni.${sezione}.label`)}
                  </h3>
                  {compilati.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("dettaglio.nessunDato")}</p>
                  ) : (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                      {compilati.map((campo) => (
                        <div key={campo.key} className="rounded-lg bg-muted/50 px-2.5 py-2">
                          <dt className="text-xs text-muted-foreground">
                            {t(`campi.${campo.key}.label`)}
                          </dt>
                          <dd className="font-medium tabular-nums">
                            {formatter.valore(misurazione[campo.key], campo.unita)}
                          </dd>
                        </div>
                      ))}
                      {sezione === "gambe" && rapporto !== null && (
                        <div className="rounded-lg border border-dashed px-2.5 py-2">
                          <dt className="text-xs text-muted-foreground">
                            {t("dettaglio.rapportoVitaFianchi")}
                          </dt>
                          <dd className="font-medium tabular-nums">{formatter.numero(rapporto, 2)}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </section>
              );
            })}

            {misurazione.note && (
              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {t("comune.note")}
                </h3>
                <p className="text-sm whitespace-pre-wrap">{misurazione.note}</p>
              </section>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => misurazione && onElimina(misurazione)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon /> {t("comune.elimina")}
          </Button>
          <Button onClick={() => misurazione && onModifica(misurazione)}>
            <PencilIcon /> {t("comune.modifica")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
