import { ActivityIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LanguageSelect } from "@/components/layout/language-select";

/** Contenitore delle pagine di autenticazione (login, reimposta password): logo + card centrata. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="absolute right-3" style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}>
        <LanguageSelect esteso />
      </div>

      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <ActivityIcon className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{t("comune.app")}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{t("auth.slogan")}</p>
      </div>

      {children}
    </main>
  );
}
