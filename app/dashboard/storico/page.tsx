import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Paginazione } from "@/components/storico/paginazione";
import { StoricoTable } from "@/components/storico/storico-table";
import { buttonVariants } from "@/components/ui/button";
import { getMisurazioniPaginate } from "@/lib/misurazioni/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("storico") };
}

export default async function StoricoPage({ searchParams }: PageProps<"/dashboard/storico">) {
  const { page } = await searchParams;
  const pagina = Number(Array.isArray(page) ? page[0] : page) || 1;

  const [{ righe, totale, pagina: paginaCorrente, pagineTotali }, t] = await Promise.all([
    getMisurazioniPaginate(pagina),
    getTranslations("storico"),
  ]);

  return (
    <>
      <PageHeader
        titolo={t("titolo")}
        descrizione={t("descrizione")}
        azioni={
          totale > 0 ? (
            <a
              href="/api/esporta-csv"
              download
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <DownloadIcon /> {t("esportaCsv")}
            </a>
          ) : undefined
        }
      />

      {totale === 0 ? (
        <EmptyState titolo={t("vuotoTitolo")} descrizione={t("vuotoDescrizione")} />
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
