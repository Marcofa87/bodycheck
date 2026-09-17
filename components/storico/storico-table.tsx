"use client";

import { useState } from "react";

import { EliminaMisurazioneDialog } from "@/components/misurazioni/elimina-misurazione-dialog";
import { MisurazioneDettaglioDialog } from "@/components/misurazioni/misurazione-dettaglio-dialog";
import { useMisurazioneSheet } from "@/components/misurazioni/misurazione-sheet-provider";
import { Table } from "@/components/ui/table";
import type { Misurazione } from "@/lib/supabase/types";
import HeaderStorico from "./componenti/HeaderStorico";
import BodyStorico from "./componenti/BodyStorico";
interface StoricoTableProps {
  righe: Misurazione[];
}

export function StoricoTable({ righe }: StoricoTableProps) {
  const { apriModifica } = useMisurazioneSheet();
  const [dettaglio, setDettaglio] = useState<Misurazione | null>(null);
  const [daEliminare, setDaEliminare] = useState<Misurazione | null>(null);

  const modifica = (m: Misurazione) => {
    setDettaglio(null);
    apriModifica(m);
  };

  const elimina = (m: Misurazione) => {
    setDettaglio(null);
    setDaEliminare(m);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <HeaderStorico />
          <BodyStorico righe={righe} />
        </Table>
      </div>

      <MisurazioneDettaglioDialog
        misurazione={dettaglio}
        open={dettaglio !== null}
        onOpenChange={(open) => !open && setDettaglio(null)}
        onModifica={modifica}
        onElimina={elimina}
      />

      <EliminaMisurazioneDialog
        misurazione={daEliminare}
        open={daEliminare !== null}
        onOpenChange={(open) => !open && setDaEliminare(null)}
      />
    </>
  );
}
