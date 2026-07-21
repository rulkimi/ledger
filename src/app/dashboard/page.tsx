import { Suspense } from "react";
import BudgetProjections from "./_components/budget-projections";
import UpcomingPayments from "./_components/upcoming-payments";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSubscriptionDialog } from "./_components/add-subscription-dialog";
import { DashboardFilters } from "./_components/dashboard-filters";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DashboardPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const filterCategory = typeof searchParams.category === "string" ? searchParams.category : undefined;
  
  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your subscriptions and track your prorated budget.</p>
        </div>
        <AddSubscriptionDialog />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
            <BudgetProjections category={filterCategory} />
          </Suspense>
          <DashboardFilters />
        </div>

        <div className="lg:col-span-8">
          <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-2xl" />}>
            <UpcomingPayments category={filterCategory} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
