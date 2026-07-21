import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateNextPaymentDate } from "@/lib/subscription-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default async function UpcomingPayments() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
  });

  const currentDate = new Date();

  const timeline = subscriptions.map((sub) => {
    const nextDate = calculateNextPaymentDate(sub.startDate, sub.billingFrequency, currentDate);
    return {
      ...sub,
      nextPaymentDate: nextDate,
    };
  }).sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {timeline.map((sub) => (
            <li key={sub.id} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{sub.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(sub.nextPaymentDate, "MMM do, yyyy")} • {sub.billingFrequency}
                </p>
              </div>
              <p className="font-bold text-destructive">${Number(sub.cost).toFixed(2)}</p>
            </li>
          ))}
          {timeline.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No subscriptions found.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
