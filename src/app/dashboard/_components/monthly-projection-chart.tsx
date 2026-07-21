import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { buildMonthlyProjection } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export default async function MonthlyProjectionChart({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";

  const subs = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      ...(category ? { category } : {}),
    },
    select: { startDate: true, billingFrequency: true, cost: true },
  });

  const projection = buildMonthlyProjection(
    subs.map((s) => ({ ...s, cost: Number(s.cost) })),
    6
  );

  const max = Math.max(...projection.map((p) => p.total), 1);
  const total6m = projection.reduce((a, p) => a + p.total, 0);
  const isEmpty = projection.every((p) => p.total === 0);

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <BarChart3 className="h-4 w-4 text-primary" />
          6-Month Cash-Flow Projection
        </CardTitle>
        {!isEmpty && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="font-semibold text-foreground">{formatCurrency(total6m, currency)}</span>
            <span>total</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 pb-6 px-6">
        {isEmpty ? (
          <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No subscriptions to project yet.</p>
            <p className="text-xs text-muted-foreground/60">Add your first bill to see your cash flow.</p>
          </div>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {projection.map((p, i) => {
              const heightPct = (p.total / max) * 100;
              const isHighest = p.total === max;
              return (
                <div key={p.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Hover tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 ease-out pointer-events-none z-20">
                    <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap text-center">
                      <p className="text-xs font-bold text-foreground">{formatCurrency(p.total, currency)}</p>
                    </div>
                    <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 mx-auto -mt-1" />
                  </div>

                  {/* Bar container */}
                  <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 ${
                        isHighest
                          ? "brand-gradient shadow-sm"
                          : i === 0
                          ? "brand-gradient opacity-90"
                          : "bg-primary/25 group-hover:bg-primary/40"
                      }`}
                      style={{
                        height: `${Math.max(heightPct, 3)}%`,
                        minHeight: "4px",
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[10px] text-muted-foreground font-medium leading-none whitespace-nowrap">
                    {p.month.split(" ")[0]}
                  </span>
                  <span className="text-[10px] font-bold text-foreground/60 font-mono leading-none">
                    {formatCurrency(p.total, currency).replace(/\.00$/, "")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
