import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginazioneProps {
  pagina: number;
  pagineTotali: number;
  totale: number;
  base: string;
}

export function Paginazione({ pagina, pagineTotali, totale, base }: PaginazioneProps) {
  const t = useTranslations();
  const precedente = pagina > 1 ? pagina - 1 : null;
  const successiva = pagina < pagineTotali ? pagina + 1 : null;

  const hrefPagina = (p: number) => (p === 1 ? base : `${base}?page=${p}`);

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        {t.rich("storico.pagina", {
          pagina,
          totale: pagineTotali,
          b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
        })}
        <span className="hidden sm:inline"> · {t("comune.misurazioni", { count: totale })}</span>
      </p>

      <div className="flex items-center gap-2">
        <LinkPagina href={precedente ? hrefPagina(precedente) : null} label={t("storico.paginaPrecedente")}>
          <ChevronLeftIcon /> <span className="hidden sm:inline">{t("storico.precedente")}</span>
        </LinkPagina>
        <LinkPagina href={successiva ? hrefPagina(successiva) : null} label={t("storico.paginaSuccessiva")}>
          <span className="hidden sm:inline">{t("storico.successiva")}</span> <ChevronRightIcon />
        </LinkPagina>
      </div>
    </div>
  );
}

function LinkPagina({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const classi = buttonVariants({ variant: "outline", size: "sm" });
  if (!href) {
    return (
      <span aria-disabled className={cn(classi, "pointer-events-none opacity-50")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={classi}>
      {children}
    </Link>
  );
}
