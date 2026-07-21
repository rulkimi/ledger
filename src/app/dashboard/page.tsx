import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryCards from "./_components/summary-cards";
import UpcomingPayments from "./_components/upcoming-payments";
import MonthlyProjectionChart from "./_components/monthly-projection-chart";
import { AddSubscriptionDialog } from "./_components/add-subscription-dialog";
import { DashboardFilters } from "./_components/dashboard-filters";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DashboardPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const sort     = typeof searchParams.sort === "string" ? searchParams.sort : "date";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your complete financial picture, in real-time.</p>
        </div>
        <AddSubscriptionDialog />
      </div>

      {/* Summary KPI cards */}
      <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>}>
        <SummaryCards category={category} />
      </Suspense>

      {/* 6-month projection chart */}
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <MonthlyProjectionChart category={category} />
      </Suspense>

      {/* Filters + timeline table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <DashboardFilters />
        </div>
        <div className="lg:col-span-9">
          <Suspense fallback={<Skeleton className="h-[500px] rounded-2xl" />}>
            <UpcomingPayments category={category} sort={sort} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
