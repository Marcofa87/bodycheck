import { TableHead, TableRow } from "@/components/ui/table";

import { TableHeader } from "@/components/ui/table";
import { useTranslations } from "next-intl";

function HeaderStorico() {
  const t = useTranslations();
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead>{t("storico.colonnaData")}</TableHead>
        <TableHead className="text-right">{t("campi.peso_kg.short")}</TableHead>
        <TableHead className="hidden text-right md:table-cell">
          {t("campi.massa_magra_kg.short")}
        </TableHead>
        <TableHead className="hidden text-right md:table-cell">
          {t("campi.massa_grassa_kg.short")}
        </TableHead>
        <TableHead className="hidden text-right sm:table-cell">
          {t("campi.grasso_corporeo_percentuale.short")}
        </TableHead>
        <TableHead className="w-12">
          <span className="sr-only">{t("comune.azioni")}</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

export default HeaderStorico;
