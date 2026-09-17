import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { useFormatMisurazioni } from "@/lib/misurazioni/format";
import { useMisurazioneSheet } from "@/components/misurazioni/misurazione-sheet-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EyeIcon, MoreHorizontalIcon, PencilIcon } from "lucide-react";
import { Misurazione } from "@/lib/supabase/types";

interface BodyStoricoProps {
  righe: Misurazione[];
}

function BodyStorico({ righe }: BodyStoricoProps) {
  const t = useTranslations();
  const formatter = useFormatMisurazioni();
  const { apriModifica } = useMisurazioneSheet();
  const modifica = (m: Misurazione) => {
    apriModifica(m);
  };
  return (
    <TableBody>
      {righe.map((m) => (
        <TableRow
          key={m.id}
          className="cursor-pointer"
          onClick={() => modifica(m)}
        >
          <TableCell>
            <div className="font-medium">
              {formatter.data(m.data_misurazione)}
            </div>
            {m.note && (
              <div className="max-w-40 truncate text-xs text-muted-foreground sm:max-w-60">
                {m.note}
              </div>
            )}
          </TableCell>
          <TableCell className="text-right font-medium tabular-nums">
            {formatter.numero(m.peso_kg)}{" "}
            <span className="text-xs text-muted-foreground">kg</span>
          </TableCell>
          <TableCell className="hidden text-right tabular-nums md:table-cell">
            {formatter.numero(m.massa_magra_kg)}
          </TableCell>
          <TableCell className="hidden text-right tabular-nums md:table-cell">
            {formatter.numero(m.massa_grassa_kg)}
          </TableCell>
          <TableCell className="hidden text-right tabular-nums sm:table-cell">
            {formatter.numero(m.grasso_corporeo_percentuale)}
          </TableCell>
          <TableCell onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("comune.azioni")}
                  />
                }
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem onClick={() => modifica(m)}>
                  <EyeIcon /> {t("comune.dettagli")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => modifica(m)}>
                  <PencilIcon /> {t("comune.modifica")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export default BodyStorico;
