import type { Metadata } from "next";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressiChart } from "@/components/progressi/progressi-chart";
import { getMisurazioni } from "@/lib/misurazioni/queries";

export const metadata: Metadata = { title: "Progressi" };

export default async function ProgressiPage() {
  const misurazioni = await getMisurazioni();

  return (
    <>
      <PageHeader
        titolo="Progressi"
        descrizione="Scegli una metrica e un periodo per vedere come cambia nel tempo."
      />

      {misurazioni.length === 0 ? (
        <EmptyState
          titolo="Ancora nessun dato da mostrare"
          descrizione="I grafici appariranno non appena avrai registrato almeno una misurazione."
        />
      ) : (
        <ProgressiChart misurazioni={misurazioni} />
      )}
    </>
  );
}
