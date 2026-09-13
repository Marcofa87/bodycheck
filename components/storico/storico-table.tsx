"use client";

import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { EliminaMisurazioneDialog } from "@/components/misurazioni/elimina-misurazione-dialog";
import { MisurazioneDettaglioDialog } from "@/components/misurazioni/misurazione-dettaglio-dialog";
import { useMisurazioneSheet } from "@/components/misurazioni/misurazione-sheet-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatData, formatNumero } from "@/lib/misurazioni/format";
import type { Misurazione } from "@/lib/supabase/types";

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
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Peso</TableHead>
              <TableHead className="hidden text-right md:table-cell">M. magra</TableHead>
              <TableHead className="hidden text-right md:table-cell">M. grassa</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Grasso %</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Azioni</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {righe.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() => setDettaglio(m)}
              >
                <TableCell>
                  <div className="font-medium">{formatData(m.data_misurazione)}</div>
                  {m.note && (
                    <div className="max-w-40 truncate text-xs text-muted-foreground sm:max-w-60">
                      {m.note}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatNumero(m.peso_kg)} <span className="text-xs text-muted-foreground">kg</span>
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {formatNumero(m.massa_magra_kg)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {formatNumero(m.massa_grassa_kg)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {formatNumero(m.grasso_corporeo_percentuale)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Azioni" />}
                    >
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuItem onClick={() => setDettaglio(m)}>
                        <EyeIcon /> Dettagli
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => modifica(m)}>
                        <PencilIcon /> Modifica
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => elimina(m)}>
                        <Trash2Icon /> Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
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
