"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
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
import { formatData } from "@/lib/misurazioni/format";
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
  const [isPending, startTransition] = useTransition();

  const conferma = () => {
    if (!misurazione) return;
    startTransition(async () => {
      const result = await eliminaMisurazione(misurazione.id);
      if (result.ok) {
        toast.success("Misurazione eliminata");
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
          <AlertDialogTitle>Eliminare questa misurazione?</AlertDialogTitle>
          <AlertDialogDescription>
            {misurazione
              ? `La misurazione del ${formatData(misurazione.data_misurazione, "d MMMM yyyy")} verrà eliminata definitivamente. L'operazione non può essere annullata.`
              : "L'operazione non può essere annullata."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={conferma}
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            {isPending ? "Eliminazione…" : "Elimina"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
