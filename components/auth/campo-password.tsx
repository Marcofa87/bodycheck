"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ComponentProps, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CampoPasswordProps extends Omit<
  ComponentProps<typeof Input>,
  "type" | "id" | "name"
> {
  id: string;
  name: string;
  label: string;
  /** Elemento opzionale a destra della label (es. link "Password dimenticata?"). */
  azione?: ReactNode;
}

/** Campo password con label e pulsante mostra/nascondi. */
export function CampoPassword({
  id,
  name,
  label,
  azione,
  className,
  ...props
}: CampoPasswordProps) {
  const t = useTranslations("auth");
  const [visibile, setVisibile] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {azione}
      </div>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visibile ? "text" : "password"}
          placeholder={t("passwordPlaceholder")}
          minLength={6}
          required
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisibile((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={visibile ? t("nascondiPassword") : t("mostraPassword")}
          tabIndex={-1}
        >
          {visibile ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
