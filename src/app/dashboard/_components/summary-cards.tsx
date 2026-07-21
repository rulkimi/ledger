import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  calculateTrueMonthlyCost,
  calculateNextPaymentDate,
  getPaymentsInWindow,
} from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, Bell } from "lucide-react";
import { addDays } from "date-fns";
import { FadeInStaggerGroup, FadeInStaggerItem } from "@/components/ui/motion-wrapper";

export default async function SummaryCards({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subs = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      ...(category ? { category } : {}),
    },
  });

  const currency = session.user.currency ?? "MYR";
  const now = new Date();

  const trueMonthlyCost = subs.reduce(
    (acc, s) => acc + calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency),
    0
  );

  const urgentCount = subs.filter((s) => {
    const next = calculateNextPaymentDate(s.startDate, s.billingFrequency, now);
    return next <= addDays(now, 7);
  }).length;

  const next30Total = subs.reduce((acc, s) => {
    const payments = getPaymentsInWindow(s.startDate, s.billingFrequency, Number(s.cost), 1, now);
    return acc + payments.reduce((a, p) => a + p.amount, 0);
  }, 0);

  const cards = [
    {
      label: "True Monthly Cost",
      value: formatCurrency(trueMonthlyCost, currency),
      sub: "Prorated across all cycles",
      icon: Wallet,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      accent: "border-l-primary",
    },
    {
      label: "6-Month Projection",
      value: formatCurrency(trueMonthlyCost * 6, currency),
      sub: "Total outflow in 6 months",
      icon: TrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
      accent: "border-l-emerald-500",
    },
    {
      label: "Due This Month",
      value: formatCurrency(next30Total, currency),
      sub: `${subs.length} active bill${subs.length !== 1 ? "s" : ""}`,
      icon: Calendar,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
      accent: "border-l-amber-500",
    },
    {
      label: "Urgent Bills",
      value: urgentCount === 0 ? "None" : urgentCount.toString(),
      sub: urgentCount > 0 ? "Due within 7 days!" : "All clear this week",
      icon: Bell,
      iconColor: urgentCount > 0 ? "text-destructive" : "text-muted-foreground",
      iconBg: urgentCount > 0 ? "bg-destructive/10" : "bg-muted/60",
      accent: urgentCount > 0 ? "border-l-destructive" : "border-l-border",
    },
  ];

  return (
    <FadeInStaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <FadeInStaggerItem key={c.label}>
          <Card
            className={`rounded-2xl border-border/60 border-l-4 ${c.accent} shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${c.iconBg}`}>
                  <c.icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none text-foreground">
                {c.value}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-2 leading-tight">{c.label}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        </FadeInStaggerItem>
      ))}
    </FadeInStaggerGroup>
  );
}
