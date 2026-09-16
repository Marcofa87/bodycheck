import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BottoneInvioProps {
  pending: boolean;
  testo: string;
  testoAttesa: string;
}

/** Bottone submit a tutta larghezza con spinner durante l'invio della action. */
export function BottoneInvio({ pending, testo, testoAttesa }: BottoneInvioProps) {
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending && <Loader2Icon className="animate-spin" />}
      {pending ? testoAttesa : testo}
    </Button>
  );
}
