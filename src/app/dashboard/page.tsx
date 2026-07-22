import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsStrip from "./_components/stats-strip";
import NextMonthPreview from "./_components/next-month-preview";
import CentoThinksCard from "./_components/cento-thinks-card";
import { AddSubscriptionDialog } from "./_components/add-subscription-dialog";
import PeakMonthsCard from "./_components/peak-months-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Overview | NetLedger",
  description: "Track your subscriptions, monthly burn, and upcoming cash flow projections on your NetLedger financial dashboard.",
};

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "User";

  return (
    <div className="flex-1 md:min-h-0 flex flex-col gap-3 pb-4">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Hi, {firstName}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your financial snapshot.</p>
        </div>
        <AddSubscriptionDialog />
      </div>

      {/* Stats strip */}
      <div className="flex-shrink-0">
        <Suspense fallback={<Skeleton className="h-12 w-full rounded-xl" />}>
          <StatsStrip />
        </Suspense>
      </div>

      {/* Main cards — flex-1 so it fills remaining height, then each col scrolls internally */}
      <div className="flex-1 md:min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left col: next month preview — scrolls internally */}
        <Suspense fallback={<Skeleton className="h-full w-full rounded-xl" />}>
          <NextMonthPreview />
        </Suspense>

        {/* Right col: Cento (grows) + peak months + quick links */}
        <div className="flex flex-col gap-3 md:min-h-0 md:h-full">
          <CentoThinksCard className="md:flex-1 md:min-h-0" />
          <Suspense fallback={<Skeleton className="h-16 w-full rounded-xl" />}>
            <PeakMonthsCard />
          </Suspense>

          {/* Quick links — only shown here on desktop */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/bills"
              className="group border border-border/60 rounded-xl px-3 h-12 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between"
            >
              <p className="text-sm font-semibold">All Bills</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              href="/dashboard/calendar"
              className="group border border-border/60 rounded-xl px-3 h-12 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between"
            >
              <p className="text-sm font-semibold">12-Month Calendar</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links — only shown on mobile below the grid */}
      <div className="flex-shrink-0 flex flex-col gap-3 md:hidden">
        <Link
          href="/dashboard/bills"
          className="group border border-border/60 rounded-xl px-3 h-12 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between"
        >
          <p className="text-sm font-semibold">All Bills</p>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
        <Link
          href="/dashboard/calendar"
          className="group border border-border/60 rounded-xl px-3 h-12 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between"
        >
          <p className="text-sm font-semibold">12-Month Calendar</p>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
