import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  calculateTrueMonthlyCost,
  calculateNextPaymentDate,
  getPaymentsInWindow,
} from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { addDays } from "date-fns";
import { Wallet, TrendingUp, Calendar, Bell } from "lucide-react";

export default async function StatsStrip({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true, ...(category ? { category } : {}) },
  });

  const currency = session.user.currency ?? "MYR";
  const now = new Date();

  const monthly = subs.reduce(
    (acc, s) => acc + calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency), 0
  );
  const next30 = subs.reduce((acc, s) => {
    const ps = getPaymentsInWindow(s.startDate, s.billingFrequency, Number(s.cost), 1, now);
    return acc + ps.reduce((a, p) => a + p.amount, 0);
  }, 0);
  const urgent = subs.filter((s) => {
    const n = calculateNextPaymentDate(s.startDate, s.billingFrequency, now);
    return n <= addDays(now, 7);
  }).length;

  const stats = [
    { icon: Wallet,    label: "Avg Monthly", value: formatCurrency(monthly, currency)    },
    { icon: TrendingUp, label: "6-Mo Average",value: formatCurrency(monthly * 6, currency) },
    { icon: Calendar,  label: "Due (30d)",   value: formatCurrency(next30, currency)     },
    { icon: Bell,      label: "Urgent",      value: urgent > 0 ? `${urgent} bill${urgent > 1 ? "s" : ""}` : "None", urgent: urgent > 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-xl overflow-hidden">
      {stats.map((s) => (
        <div key={s.label} className="bg-card flex flex-col items-center justify-center gap-0.5 px-1 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3">
          <s.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${s.urgent ? "text-destructive" : "text-muted-foreground"}`} />
          <div className="min-w-0 text-center sm:text-left">
            <p className={`text-[11px] sm:text-sm font-bold truncate ${s.urgent ? "text-destructive" : "text-foreground"}`}>{s.value}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
