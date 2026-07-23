import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  calculateTrueMonthlyCost,
  buildMonthlyProjection,
} from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { BurnRateCard } from "./burn-rate-card";
import Link from "next/link";

export default async function StatsStrip({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    include: { subscriptions: { where: { isActive: true, ...(category ? { category } : {}) } } }
  });
  if (!user) return null;

  const subs = user.subscriptions;
  const income = user.monthlyIncome ? Number(user.monthlyIncome) : null;
  const currency = user.currency ?? "MYR";
  const now = new Date();

  const monthly = subs.reduce(
    (acc, s) => acc + calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency), 0
  );

  const projection = buildMonthlyProjection(
    subs.map((s) => ({ startDate: s.startDate, billingFrequency: s.billingFrequency, cost: Number(s.cost) })),
    12,
    now
  );

  let peakMonths = ["-"];
  let peakTotal = 0;
  let lightMonths = ["-"];
  let lightTotal = 0;

  if (projection.length > 0) {
    peakTotal = Math.max(...projection.map(p => p.total));
    lightTotal = Math.min(...projection.map(p => p.total));
    
    peakMonths = projection.filter(p => p.total === peakTotal).map(p => p.month.split(" ")[0]);
    lightMonths = projection.filter(p => p.total === lightTotal).map(p => p.month.split(" ")[0]);
  }

  function formatLabels(labels: string[]) {
    if (labels.length === 1) return labels[0];
    if (labels.length <= 3) return labels.join(", ");
    return `${labels.length} mos`;
  }

  const statsAfterBurn = [
    { icon: TrendingUp,   label: `Peak Month (${formatLabels(peakMonths)})`,    value: formatCurrency(peakTotal, currency) },
    { icon: TrendingDown, label: `Light Month (${formatLabels(lightMonths)})`, value: formatCurrency(lightTotal, currency) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-xl overflow-hidden">
      {/* 1. Avg Monthly */}
      <Link href="/dashboard/bills" className="bg-card flex flex-col items-center justify-center gap-1 px-1 py-3 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:px-4 sm:py-3 hover:bg-muted/50 transition-colors group w-full h-full">
        <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        <div className="min-w-0 text-center sm:text-left flex-1">
          <p className="text-[11px] sm:text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">{formatCurrency(monthly, currency)}</p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">Avg Monthly</p>
        </div>
      </Link>
      
      {/* 2. Burn Rate Card (Interactive) */}
      <BurnRateCard monthlyExpenses={monthly} income={income} currency={currency} />

      {/* 3 & 4 */}
      {statsAfterBurn.map((s, idx) => (
        <Link href="/dashboard/calendar" key={idx} className="bg-card flex flex-col items-center justify-center gap-1 px-1 py-3 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:px-4 sm:py-3 hover:bg-muted/50 transition-colors group w-full h-full">
          <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="min-w-0 text-center sm:text-left flex-1">
            <p className="text-[11px] sm:text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">{s.value}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight truncate">{s.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
