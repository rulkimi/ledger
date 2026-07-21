import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { buildMonthlyProjection } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function MonthlyProjectionChart({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true, ...(category ? { category } : {}) },
    select: { startDate: true, billingFrequency: true, cost: true },
  });

  const projection = buildMonthlyProjection(
    subs.map((s) => ({ ...s, cost: Number(s.cost) })),
    6
  );

  const max = Math.max(...projection.map((p) => p.total), 1);

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <BarChart3 className="h-5 w-5 text-primary" />
          6-Month Cash-Flow Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3 h-44">
          {projection.map((p) => {
            const heightPct = max > 0 ? (p.total / max) * 100 : 0;
            return (
              <div key={p.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-lg whitespace-nowrap z-10 pointer-events-none">
                    {formatCurrency(p.total, currency)}
                  </div>
                  {/* Bar */}
                  <div className="w-full rounded-t-lg brand-gradient transition-all duration-500 cursor-pointer hover:opacity-90"
                    style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: "6px" }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">{p.month}</span>
                <span className="text-[10px] font-bold text-foreground/70 font-mono">{formatCurrency(p.total, currency)}</span>
              </div>
            );
          })}
        </div>
        {projection.every((p) => p.total === 0) && (
          <p className="text-center text-sm text-muted-foreground py-8">No subscriptions to project. Add one above!</p>
        )}
      </CardContent>
    </Card>
  );
}
