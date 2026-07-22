import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getPaymentsInWindow } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { format, startOfMonth, addMonths } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";

export default async function PeakMonthsCard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";
  const now = new Date();

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true },
  });

  if (subs.length === 0) return null;

  // Use start of current month so we always get full month totals (not just from today)
  const monthBase = startOfMonth(now);

  // Calculate totals for each of the next 12 months
  const months: { label: string; total: number }[] = [];

  for (let i = 0; i < 12; i++) {
    const monthStart = startOfMonth(addMonths(now, i));
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
    let total = 0;

    for (const sub of subs) {
      const payments = getPaymentsInWindow(
        sub.startDate,
        sub.billingFrequency,
        Number(sub.cost),
        i + 2,
        monthBase  // ← scan from start of current month, not from today mid-month
      );
      for (const p of payments) {
        if (p.date >= monthStart && p.date <= monthEnd) {
          total += p.amount;
        }
      }
    }

    months.push({ label: format(monthStart, "MMM yyyy"), total });
  }

  const peakTotal = Math.max(...months.map(m => m.total));
  const nonZeroMonths = months.filter(m => m.total > 0);
  const lowestTotal = nonZeroMonths.length > 0 ? Math.min(...nonZeroMonths.map(m => m.total)) : 0;

  // If all months are equal (or no variation), don't show
  if (peakTotal === lowestTotal || peakTotal === 0) return null;

  const peakMonths  = months.filter(m => m.total === peakTotal);
  const lowestMonths = months.filter(m => m.total === lowestTotal);

  // Format a list of month labels: "Jan, Feb" or "3 months" if many
  function formatLabels(ms: { label: string }[]) {
    if (ms.length === 1) return ms[0].label;
    if (ms.length <= 3) return ms.map(m => m.label.split(" ")[0]).join(", ");
    return `${ms.length} months`;
  }

  return (
    <div className="flex-shrink-0 border border-border/60 rounded-xl bg-card overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-border/60">
        {/* Peak months */}
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Peak {peakMonths.length > 1 ? `(×${peakMonths.length})` : "Month"}
            </p>
            <p className="text-xs font-bold truncate">{formatLabels(peakMonths)}</p>
            <p className="text-[11px] font-mono text-destructive font-semibold">{formatCurrency(peakTotal, currency)}</p>
          </div>
        </div>

        {/* Lightest months */}
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Lightest {lowestMonths.length > 1 ? `(×${lowestMonths.length})` : "Month"}
            </p>
            <p className="text-xs font-bold truncate">{formatLabels(lowestMonths)}</p>
            <p className="text-[11px] font-mono text-emerald-500 font-semibold">{formatCurrency(lowestTotal, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

