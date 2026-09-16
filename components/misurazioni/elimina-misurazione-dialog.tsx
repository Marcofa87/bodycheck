"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { eliminaMisurazione } from "@/lib/actions/misurazioni";
import { useFormatMisurazioni } from "@/lib/misurazioni/format";
import type { Misurazione } from "@/lib/supabase/types";

interface EliminaMisurazioneDialogProps {
  misurazione: Misurazione | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEliminata?: () => void;
}

export function EliminaMisurazioneDialog({
  misurazione,
  open,
  onOpenChange,
  onEliminata,
}: EliminaMisurazioneDialogProps) {
  const t = useTranslations();
  const formatter = useFormatMisurazioni();
  const [isPending, startTransition] = useTransition();

  const conferma = () => {
    if (!misurazione) return;
    startTransition(async () => {
      const result = await eliminaMisurazione(misurazione.id);
      if (result.ok) {
        toast.success(t("eliminazione.eliminata"));
        onOpenChange(false);
        onEliminata?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{t("eliminazione.titolo")}</AlertDialogTitle>
          <AlertDialogDescription>
            {misurazione
              ? t("eliminazione.descrizioneConData", {
                  data: formatter.data(misurazione.data_misurazione, "d MMMM yyyy"),
                })
              : t("eliminazione.descrizione")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("comune.annulla")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={conferma}
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            {isPending ? t("eliminazione.inCorso") : t("comune.elimina")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
