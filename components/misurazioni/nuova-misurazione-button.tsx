"use client";

import { PlusIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

import { useMisurazioneSheet } from "./misurazione-sheet-provider";

type Props = Omit<ComponentProps<typeof Button>, "onClick" | "children"> & {
  /** Testo del bottone; su schermi piccoli può essere nascosto con `nascondiTestoSuMobile`. */
  testo?: string;
  nascondiTestoSuMobile?: boolean;
};

export function NuovaMisurazioneButton({
  testo = "Nuova misurazione",
  nascondiTestoSuMobile = false,
  ...props
}: Props) {
  const { apriNuova } = useMisurazioneSheet();

  return (
    <Button onClick={apriNuova} {...props}>
      <PlusIcon />
      <span className={nascondiTestoSuMobile ? "hidden sm:inline" : undefined}>{testo}</span>
    </Button>
  );
}
