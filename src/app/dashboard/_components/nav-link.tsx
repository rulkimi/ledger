"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, CalendarDays, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Overview",  Icon: LayoutDashboard },
  { href: "/dashboard/bills",    label: "Bills",     Icon: List            },
  { href: "/dashboard/calendar", label: "Calendar",  Icon: CalendarDays    },
  { href: "/dashboard/advisor",  label: "Advisor",   Icon: Sparkles        },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/50 backdrop-blur-md">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? "bg-background text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
