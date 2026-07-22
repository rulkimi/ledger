import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionList from "../_components/subscription-list";
import { AddSubscriptionDialog } from "../_components/add-subscription-dialog";
import type { NormalizeView } from "@/lib/subscription-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Bills | NetLedger",
  description: "View and manage all your recurring bills and subscription costs dynamically normalized.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const VALID_VIEWS: NormalizeView[] = ["original", "weekly", "monthly", "yearly"];

export default async function BillsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const sort     = typeof searchParams.sort === "string" ? searchParams.sort : "date";
  const rawView  = typeof searchParams.view === "string" ? searchParams.view : "original";
  const view     = VALID_VIEWS.includes(rawView as NormalizeView) ? (rawView as NormalizeView) : "original";

  return (
    <div className="h-full flex flex-col space-y-5 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">All Bills</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and filter your subscriptions.</p>
        </div>
        <AddSubscriptionDialog />
      </div>

      <div className="flex-1 flex flex-col min-h-0 pb-6">
        <Suspense fallback={
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        }>
          <SubscriptionList category={category} sort={sort} view={view} />
        </Suspense>
      </div>
    </div>
  );
}
