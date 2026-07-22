"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, CalendarDays, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Overview",  Icon: LayoutDashboard },
  { href: "/dashboard/bills",    label: "Bills",     Icon: List            },
  { href: "/dashboard/calendar", label: "Calendar",  Icon: CalendarDays    },
  { href: "/dashboard/advisor",  label: "Cento",   Icon: Sparkles        },
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
            className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-active-bg"
                className="absolute inset-0 bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="h-3.5 w-3.5 relative z-10" />
            <span className="relative z-10 max-[400px]:hidden">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
