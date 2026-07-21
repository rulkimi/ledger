import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateTrueMonthlyCost } from "@/lib/subscription-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function BudgetProjections() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    select: { cost: true, billingFrequency: true }
  });

  const totalTrueMonthlyCost = subscriptions.reduce((acc, sub) => {
    return acc + calculateTrueMonthlyCost(Number(sub.cost), sub.billingFrequency);
  }, 0);

  const sixMonthProjection = totalTrueMonthlyCost * 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prorated Budget Projections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">True Monthly Cost</p>
          <p className="text-4xl font-bold">${totalTrueMonthlyCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cash to set aside monthly to cover all long-term bills.
          </p>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">6-Month Projection</p>
          <p className="text-2xl font-semibold">${sixMonthProjection.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
