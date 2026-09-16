import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressiChart } from "@/components/progressi/progressi-chart";
import { getMisurazioni } from "@/lib/misurazioni/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("progressi") };
}

export default async function ProgressiPage() {
  const [misurazioni, t] = await Promise.all([getMisurazioni(), getTranslations("progressi")]);

  return (
    <>
      <PageHeader titolo={t("titolo")} descrizione={t("descrizione")} />

      {misurazioni.length === 0 ? (
        <EmptyState titolo={t("vuotoTitolo")} descrizione={t("vuotoDescrizione")} />
      ) : (
        <ProgressiChart misurazioni={misurazioni} />
      )}
    </>
  );
}
