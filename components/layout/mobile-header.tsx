import { ActivityIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { NuovaMisurazioneButton } from "@/components/misurazioni/nuova-misurazione-button";

import { LanguageSelect } from "./language-select";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";

/** Header sticky per mobile/tablet (nascosto da lg in su). */
export function MobileHeader() {
  const t = useTranslations();

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ActivityIcon className="size-4" />
        </span>
        <span className="tracking-tight">{t("comune.app")}</span>
      </Link>

      <div className="flex items-center gap-1">
        <NuovaMisurazioneButton size="sm" testo={t("nav.nuova")} />
        <LanguageSelect />
        <ThemeToggle />
        <LogoutButton size="icon" soloIcona />
      </div>
    </header>
  );
}
