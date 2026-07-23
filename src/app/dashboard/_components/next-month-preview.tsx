import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getPaymentsInWindow } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { format, startOfMonth, addMonths, endOfMonth } from "date-fns";
import { CalendarDays, ChevronRight } from "lucide-react";
import { AddSubscriptionDialog } from "./add-subscription-dialog";

export default async function NextMonthPreview({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";
  const now      = new Date();

  const nextMonthStart = startOfMonth(addMonths(now, 1));
  const nextMonthEnd   = endOfMonth(nextMonthStart);
  const monthLabel     = format(nextMonthStart, "MMMM yyyy");

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true, ...(category ? { category } : {}) },
  });

  type PaymentHit = { name: string; date: Date; amount: number; category: string | null };
  const hits: PaymentHit[] = [];

  for (const sub of subs) {
    const payments = getPaymentsInWindow(
      sub.startDate,
      sub.billingFrequency,
      Number(sub.cost),
      2,
      now
    );
    for (const p of payments) {
      if (p.date >= nextMonthStart && p.date <= nextMonthEnd) {
        hits.push({ name: sub.name, date: p.date, amount: p.amount, category: sub.category });
      }
    }
  }

  hits.sort((a, b) => a.date.getTime() - b.date.getTime());
  const total = hits.reduce((acc, h) => acc + h.amount, 0);

  if (hits.length === 0) {
    return (
      <div className="md:h-full flex flex-col items-center justify-center border border-dashed border-border/40 rounded-xl bg-card min-h-0 text-center p-8 gap-4">
        <div className="w-12 h-12 rounded-full border border-dashed border-border/40 flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-muted-foreground/30" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Nothing due in {monthLabel}</p>
          <p className="text-xs text-muted-foreground mt-1.5">No bills are scheduled for next month.</p>
        </div>
        <AddSubscriptionDialog />
      </div>
    );
  }

  return (
    // h-full + flex flex-col + min-h-0 is the key — lets the flex-1 list scroll inside
    <div className="md:h-full flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card min-h-0">
      {/* Header — fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-border/40">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">
            Due in <span className="text-foreground">{monthLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">{hits.length} payment{hits.length !== 1 ? "s" : ""}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-sm font-bold font-mono">{formatCurrency(total, currency)}</span>
        </div>
      </div>

      {/* Payment rows — flex-1 + overflow-y-auto = scrolls inside the card */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 min-h-0">
        {hits.map((h, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-mono text-muted-foreground/70 w-12 flex-shrink-0 tabular-nums">
                {format(h.date, "d MMM")}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{h.name}</p>
                {h.category && (
                  <p className="text-[10px] text-muted-foreground/60 truncate">{h.category}</p>
                )}
              </div>
            </div>
            <p className="text-xs font-bold font-mono ml-4 flex-shrink-0">
              {formatCurrency(h.amount, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Total footer — fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-muted/20 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground font-medium">Total to prepare</p>
        <p className="text-sm font-extrabold font-mono">{formatCurrency(total, currency)}</p>
      </div>
    </div>
  );
}
