import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  calculateTrueMonthlyCost,
  calculateNextPaymentDate,
  getPaymentsInWindow,
} from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { addDays } from "date-fns";

export default async function SummaryCards({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true, ...(category ? { category } : {}) },
  });

  const currency = session.user.currency ?? "MYR";
  const now = new Date();

  const trueMonthlyCost = subs.reduce(
    (acc, s) => acc + calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency),
    0
  );
  const sixMonthTotal = trueMonthlyCost * 6;

  // Bills due in next 7 days
  const urgentCount = subs.filter((s) => {
    const next = calculateNextPaymentDate(s.startDate, s.billingFrequency, now);
    return next <= addDays(now, 7);
  }).length;

  // Total payments in next 30 days
  const next30Total = subs.reduce((acc, s) => {
    const payments = getPaymentsInWindow(s.startDate, s.billingFrequency, Number(s.cost), 1, now);
    return acc + payments.reduce((a, p) => a + p.amount, 0);
  }, 0);

  const cards = [
    {
      label: "True Monthly Cost",
      value: formatCurrency(trueMonthlyCost, currency),
      sub: "Prorated across all billing cycles",
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "6-Month Projection",
      value: formatCurrency(sixMonthTotal, currency),
      sub: "Total outflow over next 6 months",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/8",
    },
    {
      label: "Due in 30 Days",
      value: formatCurrency(next30Total, currency),
      sub: `Across ${subs.length} active subscription${subs.length !== 1 ? "s" : ""}`,
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/8",
    },
    {
      label: "Urgent Bills",
      value: urgentCount.toString(),
      sub: urgentCount > 0 ? "Due within the next 7 days" : "Nothing urgent this week",
      icon: AlertTriangle,
      color: urgentCount > 0 ? "text-destructive" : "text-muted-foreground",
      bg: urgentCount > 0 ? "bg-destructive/8" : "bg-muted/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className={`p-2.5 rounded-xl w-fit ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight leading-none">{c.value}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1.5">{c.label}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{c.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
