import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateTrueMonthlyCost } from "@/lib/subscription-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";

export default async function BudgetProjections({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const whereClause = { userId: session.user.id, ...(category ? { category } : {}) };

  const subscriptions = await prisma.subscription.findMany({
    where: whereClause,
    select: { cost: true, billingFrequency: true }
  });

  const totalTrueMonthlyCost = subscriptions.reduce((acc, sub) => {
    return acc + calculateTrueMonthlyCost(Number(sub.cost), sub.billingFrequency);
  }, 0);

  const sixMonthProjection = totalTrueMonthlyCost * 6;

  return (
    <Card className="shadow-md border-primary/20 bg-gradient-to-br from-card to-primary/5 rounded-2xl overflow-hidden">
      <div className="h-1 w-full bg-primary/40"></div>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wallet className="h-6 w-6 text-primary" />
          Budget Projections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">True Monthly Cost</p>
          <p className="text-5xl lg:text-6xl font-black tracking-tighter text-foreground">${totalTrueMonthlyCost.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground/80 mt-2 font-medium">
            The exact cash needed per month to cover {category ? 'these' : 'all'} bills.
          </p>
        </div>
        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">6-Month Projection</p>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2 text-foreground">${sixMonthProjection.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
