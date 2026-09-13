import { connection } from "next/server";

import { MobileNav } from "@/components/layout/nav-links";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Sidebar } from "@/components/layout/sidebar";
import { MisurazioneSheetProvider } from "@/components/misurazioni/misurazione-sheet-provider";
import { ConfigurazioneMancante } from "@/components/setup/configurazione-mancante";
import { requireUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  await connection();
  if (!isSupabaseConfigured()) return <ConfigurazioneMancante />;

  // Il proxy ha già fatto un controllo ottimistico; qui verifichiamo davvero la sessione.
  const user = await requireUser();

  return (
    <MisurazioneSheetProvider>
      <div className="flex min-h-svh bg-muted/30">
        <Sidebar email={user.email} />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </MisurazioneSheetProvider>
  );
}
