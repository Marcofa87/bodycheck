"use client";

import { HistoryIcon, LayoutDashboardIcon, TrendingUpIcon, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavItem {
  href: "/dashboard" | "/dashboard/storico" | "/dashboard/progressi";
  /** Chiave in `nav.*` con l'etichetta tradotta. */
  chiave: "dashboard" | "storico" | "progressi";
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", chiave: "dashboard", icon: LayoutDashboardIcon },
  { href: "/dashboard/storico", chiave: "storico", icon: HistoryIcon },
  { href: "/dashboard/progressi", chiave: "progressi", icon: TrendingUpIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

/** Navigazione verticale per la sidebar desktop. */
export function SidebarNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label={t("aria")}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="size-4" />
            {t(item.chiave)}
          </Link>
        );
      })}
    </nav>
  );
}

/** Tab bar fissa in basso per mobile. */
export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={t("aria")}
    >
      <ul className="grid grid-cols-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-5", active && "fill-primary/15")} />
                {t(item.chiave)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
