import { Suspense } from "react";
import BudgetProjections from "./_components/budget-projections";
import UpcomingPayments from "./_components/upcoming-payments";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <BudgetProjections />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <UpcomingPayments />
        </Suspense>
      </div>
    </div>
  );
}
