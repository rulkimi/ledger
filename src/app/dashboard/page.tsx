import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsStrip from "./_components/stats-strip";
import NextMonthPreview from "./_components/next-month-preview";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Overview</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your financial snapshot at a glance.</p>
      </div>

      {/* Stats */}
      <Suspense fallback={<Skeleton className="h-14 w-full rounded-xl" />}>
        <StatsStrip />
      </Suspense>

      {/* Next month preview */}
      <Suspense fallback={<Skeleton className="h-28 w-full rounded-xl" />}>
        <NextMonthPreview />
      </Suspense>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/bills"
          className="group border border-border/60 rounded-xl px-4 py-4 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold">All Bills</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your subscriptions</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/calendar"
          className="group border border-border/60 rounded-xl px-4 py-4 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold">12-Month Calendar</p>
            <p className="text-xs text-muted-foreground mt-0.5">See what hits each month</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
