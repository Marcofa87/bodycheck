import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Paginazione } from "@/components/storico/paginazione";
import { StoricoTable } from "@/components/storico/storico-table";
import { buttonVariants } from "@/components/ui/button";
import { getMisurazioniPaginate } from "@/lib/misurazioni/queries";

export const metadata: Metadata = { title: "Storico" };

export default async function StoricoPage({ searchParams }: PageProps<"/dashboard/storico">) {
  const { page } = await searchParams;
  const pagina = Number(Array.isArray(page) ? page[0] : page) || 1;

  const { righe, totale, pagina: paginaCorrente, pagineTotali } =
    await getMisurazioniPaginate(pagina);

  return (
    <>
      <PageHeader
        titolo="Storico"
        descrizione="Tutte le misurazioni registrate, dalla più recente."
        azioni={
          totale > 0 ? (
            <a
              href="/api/esporta-csv"
              download
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <DownloadIcon /> Esporta CSV
            </a>
          ) : undefined
        }
      />

      {totale === 0 ? (
        <EmptyState
          titolo="Nessuna misurazione ancora"
          descrizione="Quando inserirai la prima misurazione la troverai qui, insieme a tutte le successive."
        />
      ) : (
        <div className="space-y-4">
          <StoricoTable righe={righe} />
          <Paginazione
            pagina={paginaCorrente}
            pagineTotali={pagineTotali}
            totale={totale}
            base="/dashboard/storico"
          />
        </div>
      )}
    </>
  );
}
