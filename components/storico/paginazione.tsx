import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
  const precedente = pagina > 1 ? pagina - 1 : null;
  const successiva = pagina < pagineTotali ? pagina + 1 : null;

  const hrefPagina = (p: number) => (p === 1 ? base : `${base}?page=${p}`);

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        Pagina <span className="font-medium text-foreground">{pagina}</span> di{" "}
        <span className="font-medium text-foreground">{pagineTotali}</span>
        <span className="hidden sm:inline"> · {totale} misurazioni</span>
      </p>

      <div className="flex items-center gap-2">
        <LinkPagina href={precedente ? hrefPagina(precedente) : null} label="Pagina precedente">
          <ChevronLeftIcon /> <span className="hidden sm:inline">Precedente</span>
        </LinkPagina>
        <LinkPagina href={successiva ? hrefPagina(successiva) : null} label="Pagina successiva">
          <span className="hidden sm:inline">Successiva</span> <ChevronRightIcon />
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
