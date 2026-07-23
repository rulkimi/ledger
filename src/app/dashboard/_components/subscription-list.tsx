import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  calculateNextPaymentDate,
  calculateNormalizedCost,
  daysUntil,
  FREQUENCY_LABEL,
  FREQUENCY_SHORT,
  NORMALIZE_VIEW_SUFFIX,
  type NormalizeView,
} from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { DeleteSubscriptionButton } from "./delete-subscription-button";
import { FilterBar } from "./filter-bar";
import { EditSubscriptionDialog } from "./edit-subscription-dialog";
import type { BillingFrequency as ServerBillingFrequency } from "@/generated/prisma/client";
import { Inbox } from "lucide-react";

export default async function SubscriptionList({
  category,
  sort = "date",
  view = "original",
}: {
  category?: string;
  sort?: string;
  view?: NormalizeView;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";
  const now = new Date();

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true, ...(category ? { category } : {}) },
  });

  const enriched = subs.map((s) => {
    const raw = Number(s.cost);
    return {
      ...s,
      rawCost: raw,
      nextPaymentDate:  calculateNextPaymentDate(s.startDate, s.billingFrequency, now),
      displayAmount:    calculateNormalizedCost(raw, s.billingFrequency, view),
    };
  });

  const sorted = [...enriched].sort((a, b) => {
    if (sort === "cost") return b.displayAmount - a.displayAmount;
    if (sort === "name") return a.name.localeCompare(b.name);
    return a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime();
  });

  // Suffix shown next to the displayed amount
  const viewSuffix = NORMALIZE_VIEW_SUFFIX[view];

  return (
    <div className="h-full flex flex-col space-y-3 min-h-0">
      <FilterBar count={sorted.length} />

      {sorted.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-xl py-16 text-center gap-3">
          <div className="w-10 h-10 rounded-full border border-dashed border-border/40 flex items-center justify-center">
            <Inbox className="h-4 w-4 text-muted-foreground/30" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No subscriptions found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              {category
                ? `Nothing in "${category}". Clear the filter or add a new bill.`
                : "Add your first subscription to start tracking."}
            </p>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex-1 flex flex-col border border-border rounded-xl overflow-hidden min-h-0 bg-card">

          {/* Column header — always shown */}
          <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 bg-muted/30 border-b border-border/40">
            <span className="flex-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Subscription
            </span>
            <span className="hidden sm:block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[96px] text-right">
              Next Due
            </span>
            {view !== "original" ? (
              <span className="hidden md:block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[96px] text-right">
                Original
              </span>
            ) : (
              <span className="hidden md:block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[96px] text-right">
                /Month equiv.
              </span>
            )}
            <span className={`text-[11px] font-semibold uppercase tracking-wider min-w-[80px] text-right ${view !== "original" ? "text-primary" : "text-muted-foreground"}`}>
              {view === "original" ? "Amount" : `${NORMALIZE_VIEW_SUFFIX[view].replace("/", "")} equiv.`}
            </span>
            </div>


          <div className="flex-1 overflow-y-auto divide-y divide-border/70 min-h-0">
            {sorted.map((sub) => {
              const days         = daysUntil(sub.nextPaymentDate, now);
            const isUrgent     = days <= 7;
            const isVeryUrgent = days <= 2;
            const isNormalized = view !== "original";

            return (
              <div
                key={sub.id}
                className="group flex items-center gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors"
              >
                {/* Status dot */}
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  isVeryUrgent ? "bg-destructive animate-pulse"
                  : isUrgent   ? "bg-amber-500"
                  :              "bg-emerald-500"
                }`} />

                {/* Name + frequency tag */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{sub.name}</p>
                  <p className="text-[11px] text-muted-foreground/70 truncate">
                    {sub.category && <span>{sub.category} · </span>}
                    <span>{FREQUENCY_LABEL[sub.billingFrequency]}</span>
                    {sub.endDate && <span className="text-destructive/80 ml-1">· Ends {format(sub.endDate, "MMM yyyy")}</span>}
                  </p>
                </div>

                {/* Next due */}
                <div className="hidden sm:flex flex-col items-end min-w-[96px]">
                  <p className={`text-xs font-medium ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                    {format(sub.nextPaymentDate, "d MMM yyyy")}
                  </p>
                  <p className={`text-[11px] ${isUrgent ? "text-destructive/70 font-semibold" : "text-muted-foreground/50"}`}>
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days}d`}
                  </p>
                </div>

                {/* Original amount — shown when normalize view is active */}
                {isNormalized && (
                  <div className="hidden md:flex flex-col items-end min-w-[96px]">
                    <p className="text-xs font-mono text-muted-foreground">
                      {formatCurrency(sub.rawCost, currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50">
                      {FREQUENCY_SHORT[sub.billingFrequency]}
                    </p>
                  </div>
                )}

                {/* Display amount — raw cost with /freq label, OR normalized */}
                <div className="flex flex-col items-end min-w-[80px]">
                  <p className={`text-sm font-bold font-mono ${isNormalized ? "text-primary" : "text-foreground"}`}>
                    {formatCurrency(sub.displayAmount, currency)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {isNormalized ? viewSuffix : FREQUENCY_SHORT[sub.billingFrequency]}
                  </p>
                </div>

                {/* Actions */}
                <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0">
                  <EditSubscriptionDialog
                    id={sub.id}
                    defaultValues={{
                      name:             sub.name,
                      cost:             sub.rawCost,
                      billingFrequency: sub.billingFrequency as ServerBillingFrequency,
                      startDate:        sub.startDate,
                      category:         sub.category,
                      notes:            sub.notes,
                    }}
                  />
                  <DeleteSubscriptionButton id={sub.id} name={sub.name} />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
