import { ActivityIcon } from "lucide-react";
import Link from "next/link";

import { NuovaMisurazioneButton } from "@/components/misurazioni/nuova-misurazione-button";
import { Separator } from "@/components/ui/separator";

import { LogoutButton } from "./logout-button";
import { SidebarNav } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  email?: string | null;
}

/** Sidebar fissa, visibile solo da lg in su. */
export function Sidebar({ email }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ActivityIcon className="size-4" />
        </span>
        <Link href="/dashboard" className="text-base font-semibold tracking-tight">
          BodyTrack
        </Link>
      </div>

      <div className="px-4">
        <NuovaMisurazioneButton className="w-full" size="lg" />
      </div>

      <div className="mt-6 flex-1 px-3">
        <SidebarNav />
      </div>

      <Separator />

      <div className="flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground" title={email ?? undefined}>
            {email ?? "Utente"}
          </p>
        </div>
        <ThemeToggle />
        <LogoutButton size="icon" soloIcona />
      </div>
    </aside>
  );
}
