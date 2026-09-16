"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { LOCALES, LOCALE_INFO, isLocale, type Locale } from "@/i18n/config";
import { impostaLingua } from "@/lib/actions/lingua";
import { cn } from "@/lib/utils";

interface LanguageSelectProps {
  className?: string;
  /** Mostra il nome completo della lingua nel trigger invece del solo codice. */
  esteso?: boolean;
}

const ITEMS: Record<string, string> = Object.fromEntries(
  LOCALES.map((l) => [l, LOCALE_INFO[l].label]),
);

/** Selettore della lingua dell'interfaccia: salva la scelta in un cookie e ri-renderizza la pagina. */
export function LanguageSelect({
  className,
  esteso = false,
}: LanguageSelectProps) {
  const locale = useLocale();
  const t = useTranslations("lingua");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const cambia = (valore: string | null) => {
    if (!isLocale(valore) || valore === locale) return;
    startTransition(async () => {
      await impostaLingua(valore);
      router.refresh();
    });
  };

  return (
    <Select
      items={ITEMS}
      value={locale}
      onValueChange={cambia}
      disabled={isPending}
    >
      <SelectTrigger
        aria-label={t("cambia")}
        title={t("label")}
        className={cn(
          "h-9 gap-1.5 border-transparent bg-transparent px-2.5 shadow-none hover:bg-accent hover:text-accent-foreground dark:bg-transparent dark:hover:bg-accent",
          className,
        )}
      >
        <Bandiera locale={locale} />
        <span className={cn("text-sm font-medium", !esteso && "uppercase")}>
          {esteso ? LOCALE_INFO[locale].label : locale}
        </span>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        className="min-w-36 w-auto"
      >
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l}>
            <Bandiera locale={l} />
            {LOCALE_INFO[l].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Bandiera({ locale }: { locale: Locale }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- file statici in /public
    <img
      src={LOCALE_INFO[locale].bandiera}
      alt=""
      width={20}
      height={20}
      draggable={false}
      className="size-5 shrink-0 rounded-full"
    />
  );
}
