import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsStrip from "./_components/stats-strip";
import NextMonthPreview from "./_components/next-month-preview";
import CentoThinksCard from "./_components/cento-thinks-card";
import { AddSubscriptionDialog } from "./_components/add-subscription-dialog";
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
    <div className="space-y-6 flex-1 flex flex-col pb-6 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Hi, {firstName}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Here is your financial snapshot at a glance.</p>
        </div>
        <AddSubscriptionDialog />
      </div>

      {/* Stats */}
      <Suspense fallback={<Skeleton className="h-14 w-full rounded-xl" />}>
        <StatsStrip />
      </Suspense>

      {/* Next month preview & Cento thoughts split */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <Suspense fallback={<Skeleton className="flex-1 w-full rounded-xl" />}>
          <NextMonthPreview />
        </Suspense>
        <CentoThinksCard />
      </div>

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
